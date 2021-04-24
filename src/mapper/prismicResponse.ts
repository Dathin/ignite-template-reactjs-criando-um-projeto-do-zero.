import { PostPagination, PrismicResponse } from '../pages';

export const mapPrismicResponseToPostPagination = ({
  next_page,
  results,
}: PrismicResponse): PostPagination => ({
  next_page,
  results: results.map(({ uid, first_publication_date, data }) => ({
    uid,
    first_publication_date,
    data: {
      title:
        typeof data.title === 'string'
          ? data.title
          : data.title.find(
              (title: { type: string }) => title.type === 'heading1'
            )?.text ?? '',
      // data.title.find((title: { type: string }) => title.type === 'heading1')
      //   ?.text ?? '',
      subtitle: data.subtitle,
      author: data.author,
    },
  })),
});
