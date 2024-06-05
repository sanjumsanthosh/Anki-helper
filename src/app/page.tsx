import Wrapper from "@/components/wrapper";
import ShowOptions from "./ShowOptions";
import CodeSyntaxHighlighter from "./CodeSyntaxHighlighter";
import SelectDeck from "./SelectDeck";

export default function Home() {

  
  return (
    <section className="flex flex-col lg:flex-row w-screen">
      <section className="flex min-h-full w-full flex-col justify-between p-9 lg:h-auto">
        <Wrapper>
          <div className="mx-auto flex flex-col">
            <ShowOptions />
          </div>
        </Wrapper>
      </section>


      <section className="lg:flex min-h-full w-full flex-col justify-center items-center bg-[#d6ebe9] p-9">
        <CodeSyntaxHighlighter />
      </section>
    </section>
  );
}
