import { FormEvent, ReactElement, useEffect, useMemo, useState } from "react";
import { HanehldaView } from "../../components/HanehldaView";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import { Form } from "../signin/common";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { FindAWordWithQueryPath } from "../../routing/paths";
import { cards } from "../../data/cards";
import { getPhonetics } from "../../utils/phonetics";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { CardTable } from "../../components/CardTable";

const ContentWapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 800px;
  padding: 20px;
  margin: 0 auto;
`;

function searchCards(query: string) {
  return cards.filter(
    (c) =>
      getPhonetics(c, PhoneticsPreference.Simple).includes(query) ||
      getPhonetics(c, PhoneticsPreference.Detailed).includes(query) ||
      c.syllabary.includes(query) ||
      c.english.includes(query)
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
      <p>Enter your search in the input above and hit enter.</p>
    ) : results.length === 0 ? (
      <p>No terms found matching your query</p>
    ) : (
      <CardTable cards={results} />
    );

  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <ContentWapper>
        <Form onSubmit={onFormSubmit}>
          <input
            type="text"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            placeholder="Phonetics, Syllabary, or English..."
          />
        </Form>
        <div style={{ background: "white" }}>{resultContent}</div>
      </ContentWapper>
    </HanehldaView>
  );
}
