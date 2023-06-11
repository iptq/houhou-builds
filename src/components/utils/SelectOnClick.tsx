import { HTMLAttributes, PropsWithChildren, useCallback, useState } from "react";

export default function SelectOnClick({
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const containerRef = useCallback((element: HTMLDivElement | null) => {
    if (element) setContainer(element);
  }, []);

  const onClick = useCallback(() => {
    if (!container) return;

    const range = document.createRange();
    range.selectNodeContents(container);

    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }, [container]);

  return (
    <div onClick={onClick} ref={containerRef} {...props}>
      {children}
    </div>
  );
}
