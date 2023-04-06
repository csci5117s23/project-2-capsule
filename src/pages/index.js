import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import { env } from 'process';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  // const FLASHCARD_API_ENDPOINT = process.env.FLASHCARD_API_ENDPOINT
  // const API_KEY = process.env.API_KEY

  const FLASHCARD_API_ENDPOINT="https://notecapsule-kl0n.api.codehooks.io/dev/flashCard/"
  const API_KEY="3b4510d5-e256-4fb9-b590-4cf92786f9e5"

  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(FLASHCARD_API_ENDPOINT, {
        'method':'GET',
        'headers': {'x-apikey': API_KEY}
      })
      const data = await response.json()
      // update state -- configured earlier.
      setPosts(data);
      setLoading(false);
    }
    fetchData();
  }, [])

  if(loading) {
    return (<span>loading...</span>);
  } else {
    return (
      <>
        <Head>
          <title>Note Capsule</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.main}>
          <div className={styles.description}>
            <p>
              {posts[0].front}
            </p>
            <p>
              {posts[0].back}
            </p>
          </div>
        </main>
      </>
    )
  }
}
