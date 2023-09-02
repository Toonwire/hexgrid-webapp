import '../styles/Loader.css';

type LoaderProps = {
  children: React.ReactNode;
};

function Loader({ children }: LoaderProps) {
  return (
    <div id="loader">
      <div id="spinner" /> <span id="text">{children}</span>
    </div>
  );
}

export default Loader;
