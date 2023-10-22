import { FormEvent, ReactElement, useEffect, useMemo, useState } from "react";
import { HanehldaView } from "../../components/HanehldaView";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import { Form } from "../signin/common";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { FindAWordWithQueryPath } from "../../routing/paths";
import { searchableCards } from "../../data/cards";
import { getPhonetics } from "../../utils/phonetics";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { CardTable } from "../../components/CardTable";

const ContentWapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

function searchCards(_query: string) {
  const query = _query.toLocaleLowerCase();
  return searchableCards.filter(
    (c) =>
      getPhonetics(c, PhoneticsPreference.Simple)
        .toLocaleLowerCase()
        .includes(query) ||
      getPhonetics(c, PhoneticsPreference.Detailed)
        .toLocaleLowerCase()
        .includes(query) ||
      c.syllabary.toLocaleLowerCase().includes(query) ||
      c.english.toLocaleLowerCase().includes(query)
  );
}

export function SearchPage(): ReactElement {
  const { query: pageQuery } = useParams();
  const [query, setQuery] = useState(pageQuery ?? "");

  useEffect(() => {
    if (pageQuery) setQuery(pageQuery);
  }, [pageQuery]);

  const results = useMemo(
    () => (pageQuery ? searchCards(pageQuery) : null),
    [pageQuery]
  );

  const navigate = useNavigate();
  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    navigate(FindAWordWithQueryPath(query));
  }
  const resultContent =
    results === null ? (
      <p>...</p>
    ) : results.length === 0 ? (
      <p>No terms found matching your query</p>
    ) : (
      <div>
        <h4>Search results for "{pageQuery}"</h4>
        <CardTable cards={results} />
      </div>
    );

  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <ContentWapper>
        <div style={{ padding: "20px 20px 0 20px" }}>
          <span>
            Type below and hit enter to search in Syllabary, Phonetics, and
            English.
          </span>
          <Form onSubmit={onFormSubmit}>
            <input
              type="text"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              placeholder="Phonetics, Syllabary, or English..."
            />
          </Form>
        </div>
        <div>{resultContent}</div>
      </ContentWapper>
    </HanehldaView>
  );
}
