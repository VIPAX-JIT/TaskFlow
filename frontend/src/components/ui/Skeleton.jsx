export default function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return <div className={`tf-skeleton ${rounded} ${className}`} />;
}
