import ShowGenerations from "./ShowGenerations";
import Wrapper from "./wrapper";


export default function GPTReadingList() {
    
  
  return (
    <section className="flex flex-col lg:flex-row">
      <section className="flex h-screen w-full flex-col justify-between p-9 lg:h-auto">
        <Wrapper>
          <div className="mx-auto flex flex-col">
            <ShowGenerations />
          </div>
        </Wrapper>
      </section>
    </section>
  );
}