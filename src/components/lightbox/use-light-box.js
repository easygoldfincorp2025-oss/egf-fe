import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------
export default function useLightBox(slide) {
  const [selected, setSelected] = useState(false);

  const handleOpen = useCallback(() => {
    setSelected(true);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(false);
  }, []);

  return {
    selected,
    open: selected,
    onOpen: handleOpen,
    onClose: handleClose,
    setSelected,
  };
}
