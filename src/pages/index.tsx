import { GetStaticProps } from 'next';
import { FiCalendar, FiAnchor } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useState } from 'react';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { toDefaultAppFormat } from '../util/dateUtil';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  return (
    <main className={styles.container}>
      {posts.map(post => (
        <a key={post.uid}>
          <strong>{post.data.title}</strong>
          <p>{post.data.subtitle}</p>
          <div>
            <span>
              <FiCalendar size="19.09" />
              <time>
                {toDefaultAppFormat(new Date(post.first_publication_date))}
              </time>
            </span>
            <span>
              <FiAnchor size="19.09" />
              <time>{post.data.author}</time>
            </span>
          </div>
        </a>
      ))}
    </main>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const { next_page, results } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const postsPagination = {
    next_page,
    results: results.map(({ uid, first_publication_date, data }) => ({
      uid,
      first_publication_date,
      data: {
        title:
          data.title.find(
            (title: { type: string }) => title.type === 'heading1'
          )?.text ?? '',
        subtitle: data.subtitle,
        author: data.author,
      },
    })),
  };

  return {
    props: {
      postsPagination,
    },
  };
};
