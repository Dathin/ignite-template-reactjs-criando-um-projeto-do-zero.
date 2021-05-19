import {
  GetStaticPathsContext,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ParsedUrlQuery } from 'node:querystring';
import { FiCalendar } from 'react-icons/fi';
import { mapPrismicPostToPostProps } from '../../mapper/prismicResponse';

import { getPrismicClient } from '../../services/prismic';

import { toDefaultAppFormat } from '../../util/dateUtil';
import styles from './post.module.scss';
import Comments from '../../components/Comments';

export interface Post {
  first_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
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
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  function calculateReadTimeInMinutes(contents: any[]): number {
    let words = 0;
    contents.forEach(content =>
      content.body.forEach(contentBody => {
        words += contentBody.text.split(' ').length;
      })
    );
    const averageReadWordsPerMinute = 200;
    return Math.ceil(words / averageReadWordsPerMinute);
  }
  const readTime = calculateReadTimeInMinutes(post.data.content);

  return (
    <div className={styles.container}>
      <Image
        src={post.data.banner.url}
        alt="Post Banner"
        width={1}
        height={0.38}
        layout="responsive"
      />
      <main>
        <h1>{post.data.title}</h1>
        <div>
          <span>
            <FiCalendar size="19.09" />
            <time>
              {toDefaultAppFormat(new Date(post.first_publication_date))}
            </time>
          </span>
          <span>
            <FiCalendar size="19.09" />
            <time>{post.data.author}</time>
          </span>
          <span>
            <FiCalendar size="19.09" />
            <time>{`${readTime} min`}</time>
          </span>
        </div>
        {post.data.content.map(content => (
          <div key={content.heading}>
            <h2>{content.heading}</h2>
            {content.body.map(body => (
              <p key={body.text}>{body.text}</p>
            ))}
          </div>
        ))}
      </main>
      <Comments />
    </div>
  );
}

export const getStaticPaths = async (
  getStaticPathsContext: GetStaticPathsContext
): Promise<GetStaticPathsResult> => {
  return {
    paths: [
      {
        params: {
          slug: 'como-utilizar-hooks',
        },
      },
      {
        params: {
          slug: 'criando-um-app-cra-do-zero',
        },
      },
    ],
    fallback: true,
  };
};

export const getStaticProps = async ({
  params,
}: GetStaticPropsContext<ParsedUrlQuery>): Promise<
  GetStaticPropsResult<PostProps>
> => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const prismicPost = await prismic.getByUID('posts', String(slug), {});
  return {
    props: {
      post: mapPrismicPostToPostProps(prismicPost),
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
