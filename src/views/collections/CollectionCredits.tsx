import { ReactElement } from "react";
import { Collection } from "../../data/vocabSets";

export function CollectionCredits({
  collection: { credits },
}: {
  collection: Collection;
}): ReactElement {
  return (
    <div>
      <p>
        <strong>Author:</strong> {credits.author}
      </p>
      <p>{credits.description}</p>
      {credits.externalResources.length > 0 && (
        <>
          <h3>External resources</h3>
          <ul>
            {credits.externalResources.map((resource, i) => (
              <li key={i}>
                <a href={resource.href}>{resource.name}</a>
                {resource.notes && <p>{resource.notes}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
