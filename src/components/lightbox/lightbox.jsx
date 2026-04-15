import PropTypes from 'prop-types';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Video from 'yet-another-react-lightbox/plugins/video';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import ReactLightbox from 'yet-another-react-lightbox';

import Iconify from '../iconify';
import StyledLightbox from './styles';
import { Box } from '@mui/system';

// ----------------------------------------------------------------------

export default function Lightbox({
                                   image,
                                   disabledZoom,
                                   disabledVideo,
                                   disabledCaptions,
                                   disabledFullscreen,
                                   ...other
                                 }) {
  return (
    <Box className={'navParent'}>
      <StyledLightbox />
      <ReactLightbox
        slides={[{ src: image }]}
        animation={{ swipe: false }}
        controller={{
          closeOnBackdropClick: true,
          closeOnSlideClick: false,
          touchAction: 'none',
          navigation: false,
          focus: false,
          keyboard: false,
        }}
        plugins={getPlugins({
          disabledZoom,
          disabledFullscreen,
        })}
        carousel={{
          loop: false,
          finite: true,
        }}
        toolbar={{
          buttons: ['close'],
        }}
        render={{
          iconClose: () => <Iconify width={24} icon="carbon:close" />,
          iconZoomIn: () => <Iconify width={24} icon="carbon:zoom-in" />,
          iconZoomOut: () => <Iconify width={24} icon="carbon:zoom-out" />,
          iconExitFullscreen: () => <Iconify width={24} icon="carbon:center-to-fit" />,
          iconEnterFullscreen: () => <Iconify width={24} icon="carbon:fit-to-screen" />,
        }}
        {...other}
      />
    </Box>
  );
}
Lightbox.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    type: PropTypes.string,
    poster: PropTypes.string,
  }).isRequired,
  disabledCaptions: PropTypes.bool,
  disabledFullscreen: PropTypes.bool,
  disabledVideo: PropTypes.bool,
  disabledZoom: PropTypes.bool,
};

// ----------------------------------------------------------------------

function getPlugins({
                      disabledZoom,
                      disabledVideo,
                      disabledCaptions,
                      disabledFullscreen,
                    }) {
  let plugins = [Captions, Fullscreen, Video, Zoom];

  if (disabledCaptions) {
    plugins = plugins.filter((plugin) => plugin !== Captions);
  }
  if (disabledFullscreen) {
    plugins = plugins.filter((plugin) => plugin !== Fullscreen);
  }
  if (disabledZoom) {
    plugins = plugins.filter((plugin) => plugin !== Zoom);
  }
  if (disabledVideo) {
    plugins = plugins.filter((plugin) => plugin !== Video);
  }

  return plugins;
}
