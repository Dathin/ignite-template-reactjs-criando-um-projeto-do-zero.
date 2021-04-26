import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar } from 'react-icons/fi';
import { mapPrismicPostToPostProps } from '../../mapper/prismicResponse';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

export interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
    readTime: number;
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <img src={post.data.banner.url} alt="Post Banner" />
      <main>
        <h1>{post.data.title}</h1>
        <div>
          <span>
            <FiCalendar size="19.09" />
            <time>{post.first_publication_date}</time>
          </span>
          <span>
            <FiCalendar size="19.09" />
            <time>{post.data.author}</time>
          </span>
          <span>
            <FiCalendar size="19.09" />
            <time>{`${post.data.readTime} min`}</time>
          </span>
        </div>
        {post.data.content.map(content => (
          <>
            <h2>{content.heading}</h2>
            {content.body.map(body => (
              <p>{body.text}</p>
            ))}
          </>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const prismicPost = await prismic.getByUID('posts', String(slug), {});
  return {
    props: {
      post: mapPrismicPostToPostProps(prismicPost),
    },
    //revalidate: 60 * 30, // 30 minutes
  };
};
