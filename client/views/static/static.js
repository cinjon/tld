Template.static.page = function () {
  slug = Router.current().params.slug;
  if (Template[slug]){
    return Template[slug];
  } else {
    return Template["404"];
  }
};
