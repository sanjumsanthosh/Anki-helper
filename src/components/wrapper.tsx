
export default function Wrapper({ children }: { children: React.ReactNode }) {

    return (
    <>
        <div className="flex w-full items-center justify-between">
        <div
            className={`flex items-center text-2xl font-bold dark:text-white`}
        >
            Anki.{" "}
            <span
            className={`text-sm font-bold group ml-2 inline-block rounded-3xl bg-[#fafafa] px-3 text-black`}
            >
            <span className="">Helper</span>
            </span>
        </div>
        </div>
        {children}
        
    </>
    );
}