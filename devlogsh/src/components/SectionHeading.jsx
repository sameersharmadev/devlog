export default function SectionHeading({ children }) {
    return (
      <div className="flex items-center gap-6 mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-medium whitespace-nowrap">
          {children}
        </h2>
        <div className="flex-1 h-px bg-accent" />
      </div>
    );
  }
  