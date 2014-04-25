#!/usr/bin/env ruby

require 'rubygems'
require 'feedjira'
require 'open-uri'
require 'fileutils'
require 'mp3info'
require 'awesome_print'
require 'mongo'
include Mongo

#GLOBALS

WORKING = "/var/podcasts/tmp/"
LIMIT = 1

# setup mongo connection

MODE = "dev"
# MODE = "prod"
# MODE = "staging"

if MODE == "dev"
  mongo_client = MongoClient.new("localhost", 3001)
  db = mongo_client.db("meteor")
elsif MODE == "prod"
  mongo_client = MongoClient.new("localhost", 27017)
  db = mongo_client.db("timelined")
elsif MODE == "staging"
  mongo_client = MongoClient.new("localhost", 27017)
  db = mongo_client.db("timelined")
end

shows = db["shows"]
episodes = db["episodes"]
chapters = db["chapters"]



# METHODS

def cleanup(keyname)
  File.delete(WORKING + keyname)
end

def download_file(entry, count)
  if entry["enclosure_url"] != nil
    url = entry["enclosure_url"]
  else
    # feeds can be misidentified, this seems to catch them if they fail
    url = entry["image"]
  end
  path = File.expand_path(WORKING)
  filename = File.basename(url)
  new_path = File.expand_path(filename, path)
  unless File.exists?(new_path)
    puts "Downloading #{filename} count #{count} of #{LIMIT} max..."
    temp = open(url)
    FileUtils.mv(temp.path, new_path)
  end
  return filename
end

def episode_type(filename)
  extension = File.extname(filename)
  if extension == ".mp3"
    return "audio"
  end

  if extension == ".mp4"
    return "video"
  end
end

def format(filename)
  extension = File.extname(filename)
  extension[0] = ''
  return extension
end

def generate_meteor_id(length=17)
  chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  value = ''
  length.times { |i| value << chars[rand(chars.length)] }
  return value
end

def length_in_seconds(filename)
  Mp3Info.open(WORKING + filename) do |mp3|
    l = mp3.length
    return l.round
  end
end

def put_chapter_in_mongo(episode_id, chapters)
  puts "Putting chapter in Mongo..."
  chapter = {
    :_id => generate_meteor_id,
    :title => "Introduction",
    :first => true,
    :episode_id => episode_id,
    :editor_id => 'autogen',
    :start_time => 0,
    :highlights => [],
    :next_chapter_id => '',
    :created_at => Time.now,
    :updated_at => Time.now
  }
  chapter_id = chapters.insert(chapter)
  return chapter_id
end

def put_episode_in_mongo(entry, filename, show_id, show_route, episodes, chapters)
  puts "Putting #{entry['title']} in Mongo..."
  key = %x{md5sum #{WORKING + filename}}
  episode = {
    :_id => generate_meteor_id,
    :type => episode_type(filename),
    :format => format(filename),
    :title => entry['title'],
    :route => "",
    :number => -1,
    :storage_key => key.split[0],
    :show_route => show_route,
    :show_id => show_id,
    :hosts => [],
    :guests => [],
    :chapters => [],
    :highlights => [],
    :postedited => false,
    :editor_id => "",
    :length_in_seconds => length_in_seconds(filename),
    :created_at => Time.now,
    :updated_at => Time.now,
    :published => false,
    :summary => "",
    :trial => false,
    :feed => {}
  }
  entry.each do |key, value|
    episode[:feed]["#{key}"] = value
  end
  chapter_id = put_chapter_in_mongo(episode[:_id], chapters)
  episode[:chapters][0] = chapter_id
  id = episodes.insert(episode)
  unless id
    chapters.remove(:_id => chapter_id)
    puts "Episode insert failed removing chapter..."
    return
  end
  puts "Episode inserted with id [#{id}]..."
end

def rename_file( filename )
  key = %x{md5sum #{WORKING + filename} }
  keyname = key.split[0] + File.extname(filename)
  File.rename(WORKING + filename, WORKING + keyname)
  puts "Renaming #{filename} to #{keyname}..."
  return keyname
end

def upload_file( keyname )
  puts "Uploading #{keyname} to S3 please be patient..."
  folder = episode_type( keyname )
  if MODE == "prod"
    %x{s3cmd put #{WORKING + keyname} s3://timelined/#{folder}/#{keyname}}
  end
  if MODE == "staging"
    %x{s3cmd put #{WORKING + keyname} s3://timelined-staging/#{folder}/#{keyname}}
  end
  puts "Upload complete..."
end


# MAIN


all_shows = shows.find
puts "Getting shows from Mongo..."
all_shows.each do |show|
  puts "Working on #{show["name"]}..."
  #TODO: make sure this works properly
  most_recent = episodes.find("show_id" => show["_id"]).sort("feed.published" => :desc)
  most_recent.each do |e|
    puts e["title"]
  end

  puts "Getting feed..."
  feed = Feedjira::Feed.fetch_and_parse(show["feed"])
  count = 0
  feed.entries.each do |entry|
    #TODO: see if there are any new items since the last show item in mongo
    if episodes.find_one("feed.entry_id" => entry["entry_id"])
      # already have it
      puts "already in database: " + entry.url
    else
      count = count + 1
      if count <= LIMIT
        filename = download_file(entry, count)
        put_episode_in_mongo(entry, filename, show['_id'], show['route'], episodes, chapters)
        keyname = rename_file( filename )
        upload_file(keyname)
        cleanup(keyname)
      end
    end
  end

end
