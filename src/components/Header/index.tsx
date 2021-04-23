import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <Link href="/">
      <div className={styles.container}>
        <img src="/images/logo.svg" alt="logo" />
      </div>
    </Link>
  );
}