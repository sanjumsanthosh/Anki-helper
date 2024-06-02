import ShowGenerations from "./ShowGenerations";
import Wrapper from "./wrapper";


export default function GPTReadingList() {
  return (
    <section className="flex flex-wrap flex-col lg:flex-row">
        <section className="flex h-full w-full flex-col justify-between p-9 lg:h-auto">
            <Wrapper>
                <div className="mx-auto flex flex-col">
                    <ShowGenerations />
                </div>
            </Wrapper>
        </section>
    </section>
  );
}