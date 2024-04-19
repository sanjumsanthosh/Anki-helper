import Wrapper from "@/components/wrapper";
import ShowStatus from "./ShowStatus";
import DisplayResults from "./DisplayResults";

export default function Home() {

  
  return (
    <section className="flex flex-col lg:flex-row">
      <section className="flex h-screen w-full flex-col justify-between p-9 lg:h-auto">
        <Wrapper>
          <div className="mx-auto flex max-w-sm flex-col justify-between">
            <ShowStatus />
          </div>
        </Wrapper>
      </section>

      {/* second half */}

      <section className="lg:flex h-screen w-full flex-col justify-center items-center bg-[#d6ebe9] p-9">
        <DisplayResults />
      </section>
    </section>
  );
}
