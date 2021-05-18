import { FiCalendar, FiAnchor } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useState } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import { get } from '../services/fetch';
import { mapPrismicPostsToPostPagination } from '../mapper/prismicResponse';
import { toDefaultAppFormat } from '../util/dateUtil';

export interface PrismicPosts {
  next_page: string;
  results: {
    uid: string;
    first_publication_date: string;
    data: {
      title: any[];
      subtitle: string;
      author: string;
    };
  }[];
}

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

export interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  async function loadMorePosts(): Promise<void> {
    if (nextPage) {
      const prismicResponse = await get<PrismicPosts>(nextPage);
      const postPagination = mapPrismicPostsToPostPagination(prismicResponse);
      setPosts([...posts, ...postPagination.results]);
      setNextPage(postPagination.next_page);
    }
  }
  return (
    <div className={styles.container}>
      <main>
        {posts.map(post => (
          <Link key={post.uid} href={`post/${post.uid}`}>
            <a>
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
          </Link>
        ))}
      </main>
      {nextPage && (
        <button type="button" onClick={loadMorePosts}>
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = (await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  )) as PrismicPosts;

  const postsPagination = mapPrismicPostsToPostPagination(response);
  return {
    props: {
      postsPagination,
    },
  };
};
