// Home provisória da Fase 0; a home completa (spec §6.1) é construída na Fase 2
export default function HomePage() {
  return (
    <section className="bg-azul-profundo text-branco">
      <div className="mx-auto max-w-[1280px] px-4 py-20 lg:px-8 lg:py-28">
        <p className="text-sm font-semibold tracking-wide text-blue-200">
          ANÁLISES INDEPENDENTES · NÃO VENDEMOS PRODUTOS
        </p>
        <h1 className="mt-3 text-4xl font-extrabold lg:text-6xl">
          Compare. Entenda. <span className="text-verde">Decida.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-blue-100 lg:text-xl">
          Análises, comparativos e guias completos para você escolher o melhor produto, sem complicação.
        </p>
        <p className="mt-8 text-sm text-blue-200">Site em construção.</p>
      </div>
    </section>
  )
}
