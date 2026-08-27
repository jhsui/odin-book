const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));

export default formatDateTime;
