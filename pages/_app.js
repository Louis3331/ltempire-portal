import '../styles/globals.css';
import MouseEffect from '../components/MouseEffect';

export default function App({ Component, pageProps }) {
  return (
    <>
      <MouseEffect />
      <Component {...pageProps} />
    </>
  );
}
