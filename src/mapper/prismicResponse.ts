import { PostPagination, PrismicPosts } from '../pages';
import { Post } from '../pages/post/[slug]';
import { toDefaultAppFormat } from '../util/dateUtil';

export const mapPrismicPostsToPostPagination = ({
  next_page,
  results,
}: PrismicPosts): PostPagination => ({
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
      subtitle: data.subtitle,
      author: data.author,
    },
  })),
});

export const mapPrismicPostToPostProps = ({
  first_publication_date,
  data,
}: any): Post => {
  let words = 0;
  return {
    first_publication_date: toDefaultAppFormat(
      new Date(first_publication_date)
    ),
    data: {
      title:
        typeof data.title === 'string'
          ? data.title
          : data.title.find(
              (title: { type: string }) => title.type === 'heading1'
            )?.text ?? '',
      banner: {
        url: data.banner.url,
      },
      author: data.author,
      content: data.content.map(content => ({
        heading: content.heading,
        body: content.body.map(body => {
          words += body.text.split(' ').length;
          return {
            text: body.text,
          };
        }),
      })),
      readTime: calculateReadTimeInMinutes(words),
    },
  };
};

const calculateReadTimeInMinutes = (words: number): number => {
  const averageReadWordsPerMinute = 200;
  return Math.ceil(words / averageReadWordsPerMinute);
};
