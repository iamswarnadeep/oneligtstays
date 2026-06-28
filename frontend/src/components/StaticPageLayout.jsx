import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function StaticPageLayout({ title, intro, meta, sections }) {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20 lg:px-10">
          <Link
            to="/"
            className="mb-6 inline-flex items-center text-sm font-medium text-stone-600 transition hover:text-stone-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <h1 className="font-display text-4xl tracking-tight text-stone-950 md:text-5xl">
            {title}
          </h1>
          {intro && <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">{intro}</p>}
          {meta && <p className="mt-4 text-sm text-stone-500">{meta}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 md:py-16 lg:px-10">
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm md:p-12">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <section key={index} className="space-y-3">
                {section.heading && (
                  <h2 className="text-2xl font-semibold text-stone-900">{section.heading}</h2>
                )}

                {section.body && Array.isArray(section.body) ? (
                  section.body.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="text-lg leading-8 text-stone-700">
                      {paragraph}
                    </p>
                  ))
                ) : section.body ? (
                  <p className="text-lg leading-8 text-stone-700">{section.body}</p>
                ) : null}

                {section.list && (
                  <ul className="list-disc space-y-2 pl-6 text-lg leading-8 text-stone-700">
                    {section.list.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
