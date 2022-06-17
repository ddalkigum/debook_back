const filterURLSlug = (title: string, slug: string) => {
  let filterTitle;
  if (title.includes(slug)) {
    filterTitle = title.slice(0, title.length - slug.length - 1);
  }
  return filterTitle;
};

export default { filterURLSlug };
