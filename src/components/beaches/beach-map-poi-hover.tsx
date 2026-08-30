type BeachMapPoiHoverProps = {
  category: string;
  name: string;
};

export function BeachMapPoiHover({ category, name }: BeachMapPoiHoverProps) {
  return (
    <div className="pointer-events-none max-w-[14rem] rounded-md border border-border bg-card px-2.5 py-2 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{category}</p>
      <p className="text-sm font-semibold break-words text-foreground">{name}</p>
    </div>
  );
}
