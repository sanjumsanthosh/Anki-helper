import { Suspense } from "react";
import { getServerGenerations } from "../actions";
import { GeneratedDataTable } from "./data-table";
import Wrapper from "./wrapper";

export default function GPTGenerations() {
    return (
      <section className="flex flex-wrap flex-col lg:flex-row w-full max-w-screen">
          <section className="flex h-full flex-col justify-between p-9 lg:h-auto w-full">
              <Wrapper>
                    <Suspense>
                      <GeneratedDataTable getServerGenerations={getServerGenerations} />
                    </Suspense>
              </Wrapper>
          </section>
      </section>
    );
  }
