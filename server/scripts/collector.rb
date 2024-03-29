#!/usr/bin/env ruby

require 'audioinfo'
require 'awesome_print'
require 'feedjira'
require 'fileutils'
require 'mongo'
require 'open-uri'
require 'optparse'
require 'youtube_it'
include Mongo


#TODO have option to do a single show
#TODO option to do only new episodes

# OPTIONS

options = {}
OptionParser.new do |opts|
  opts.banner = "Usage: collector.rb [options]"

  # opts.on('--new', 'Get new episodes only') { |v| options[:new] = true}
  # opts.on('--verbose', 'Verbose output') { |v| options[:verbose] = true }
  opts.on('-s', '--show SHOW', 'Get a single show by show route') { |v| options[:show] = v }

end.parse!

# GLOBALS

WORKING = "/var/podcasts/tmp/"
LIMIT = 1

# check runtime environment

hostname = `hostname`.chomp
if hostname == "tlproduction"
  MODE = "prod"
elsif hostname == "tlstaging"
  MODE = "staging"
else
  MODE = "dev"
end

puts "***\nMODE: " + MODE + "\n***\n"

# setup mongo connection

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

def ensure_unique_route(original_title, episodes)
  new_title = original_title
  count = 0
  while episodes.find_one("title" => new_title ) do
    count += 1
    new_title = original_title + " #{count}"
  end
  return new_title
end

def episode_type(filename)
  if filename == "youtube"
    return "video"
  end
  extension = File.extname(filename)
  if extension == ".mp3"
    return "audio"
  end
  if extension == ".mp4"
    return "video"
  end
  if extension == ".m4a"
    return "audio"
  end
  if extension == ".m4v"
    return "video"
  end
end

def format(filename)
  if filename == "youtube"
    return "youtube"
  end
  extension = File.extname(filename)
  extension[0] = ''
  return extension
end

def generate_episode_route(title, episodes)
  # allow alphanumerics, '-', ' ', '_' chars to stay
  # this might grow to handle more special chars like '&'
  title = title.downcase.strip.gsub(/[^0-9a-z\-_ ]/i, '').gsub("\n", '')
  title = ensure_unique_route(title, episodes)
  # replace ' ' and '_' with '-'
  route = title.gsub(/[ _]/, '-').squeeze('-')
  return route
end

def generate_meteor_id(length=17)
  chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  value = ''
  length.times { |i| value << chars[rand(chars.length)] }
  return value
end

def length_in_seconds(filename, key)
  file_format = format(filename)
  if file_format == "youtube"
    youtube_client = YouTubeIt::Client.new(:dev_key => "AIzaSyAoi9jAbPNAiYGb_NYqr0icQqUCrbjpNJg")
    video = youtube_client.video_by(key)
    return video.duration || 0
  else
    # this should handle mp3, mp4, m4a, m4v
    info = AudioInfo.open(WORKING + filename)
    return info.length || 0
  end
end


def podcast(entry, count, show, episodes, chapters)
  filename = download_file(entry, count)
  put_episode_in_mongo(entry, filename, show, episodes, chapters)
  keyname = rename_file(filename)
  upload_file(keyname)
  cleanup(keyname)
end

def process_feed(feed, show, episodes, chapters)
  count = 0
  feed.entries.each do |entry|
    #TODO: see if there are any new items since the last show item in mongo
    if episodes.find_one("feed.entry_id" => entry.entry_id)
      puts "already in database: " + entry.url
    else
      count += 1
      process_feed_type(entry, count, show, episodes, chapters) if count <= LIMIT
    end
  end
end

def process_feed_type(entry, count, show, episodes, chapters)
  url = URI(entry.url)
  if url.host =~ /youtube.com/
    youtube(entry, count, show, episodes, chapters)
  else
    podcast(entry, count, show, episodes, chapters)
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
    :next_chapter_id => nil,
    :created_at => Time.now,
    :updated_at => Time.now
  }
  chapter_id = chapters.insert(chapter)
  return chapter_id
end

def put_episode_in_mongo(entry, filename, show, episodes, chapters)
  puts "Putting #{entry['title']} in Mongo..."
  if filename == 'youtube'
    path = URI(entry.entry_id).path
    key = path.split('/').last
  else
    key = %x{md5sum #{WORKING + filename}}
    key = key.split[0]
  end

  episode = {
    :_id => generate_meteor_id,
    :type => episode_type(filename),
    :format => format(filename),
    :title => title_scrub(entry, show),
    :route => generate_episode_route(entry['title'], episodes),
    :number => -1,
    :storage_key => key,
    :show_route => show['route'],
    :show_id => show['_id'],
    :hosts => [],
    :guests => [],
    :sponsors => [],
    :chapters => [],
    :highlights => [],
    :postedited => false,
    :postedited_at => nil,
    :claimed_at => nil,
    :claimed_previously_by => nil,
    :editor_id => nil,
    :length_in_seconds => length_in_seconds(filename, key),
    :created_at => Time.now,
    :updated_at => Time.now,
    :published => false,
    :summary => nil,
    :trial => false,
    :hidden => false,
    :payment_id => "",
    :feed => {}
  }
  entry.each do |key, value|
    episode[:feed]["#{key}"] = value
  end

  # youtube specifc stuff here, will refactor this when we get more data
  if episode[:format] == 'youtube'
    episode[:feed][:summary] = youtube_summary(key)
    episode[:hidden] = true if episode[:length_in_seconds] < 900
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

def title_scrub(entry, show)
  old_title = entry['title']
  show_name = show['name']
  # trying to match show name and possible special characters, strip leading whitespace
  new_title = old_title.gsub(/^#{show_name}[:#-_]/, '').strip
  return new_title
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

def youtube(entry, count, show, episodes, chapters)
  put_episode_in_mongo(entry, "youtube", show, episodes, chapters)
end

def youtube_summary(key)
  youtube_client = YouTubeIt::Client.new(:dev_key => "AIzaSyAoi9jAbPNAiYGb_NYqr0icQqUCrbjpNJg")
  video = youtube_client.video_by(key)
  return video.description || ""
end



# MAIN

if options[:show] == nil
  # get all shows
  selected_shows = shows.find("feed_active" => true)
  puts "Getting ALL active shows from Mongo..."
else
  selected_shows = shows.find("route" => options[:show])
  puts "Getting ONLY #{options[:show]} from Mongo..."
end

selected_shows.each do |show|
  puts "SHOW: #{show['name']}"
  #TODO: make sure this works properly
  most_recent = episodes.find("show_id" => show["_id"], "trial" => false).sort("feed.published" => :desc)
  most_recent.each {|e| puts "EPISODE: #{e['title']}"}
  puts "Getting feed..."
  success_callback = lambda { |url, feed| process_feed(feed, show, episodes, chapters) }
  failure_callback = lambda { |curl, err| puts curl, err }
  feed = Feedjira::Feed.fetch_and_parse show["feed"], on_success: success_callback, on_failure: failure_callback
end
