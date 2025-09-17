import React from 'react';

// Este es un "componente de presentación".
// No tiene lógica propia, solo recibe datos (props) y los muestra.
// Recibe `id`, `title`, `excerpt` y una función `onShowComments`.

function NewsCard({ id, title, excerpt, onShowComments }) {
  return (
    <article className="news-card">
      <div className="card-content">
        <h2>{title}</h2>
        <p>{excerpt}</p>
      </div>
      <div className="card-actions">
        {/* Al hacer clic, llama a la función que recibió por props, pasándole su propio id */}
        <button onClick={() => onShowComments(id)}>
          Ver Comentarios
        </button>
      </div>
    </article>
  );
}

export default NewsCard;