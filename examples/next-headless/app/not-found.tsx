import Link from 'next/link';

export default function NotFound() {
  return (
    <article className="product">
      <div className="product__text">
        <p className="product__code">404</p>
        <h1 className="product__title">Not in this edition</h1>
        <Link className="product__back" href="/#catalogue">
          Back to the catalogue
        </Link>
      </div>
    </article>
  );
}
