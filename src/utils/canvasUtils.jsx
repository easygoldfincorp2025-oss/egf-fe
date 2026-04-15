export const getCroppedImg = (imageSrc, croppedAreaPixels, rotation = 0) => {
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); 
      image.src = url;
    });

  const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

  const rotateSize = (width, height, rotation) => {
    const rotRad = getRadianAngle(rotation);

    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  return new Promise(async (resolve, reject) => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const rotatedSize = rotateSize(image.width, image.height, rotation);
      canvas.width = rotatedSize.width;
      canvas.height = rotatedSize.height;

      ctx.translate(rotatedSize.width / 2, rotatedSize.height / 2);
      ctx.rotate(getRadianAngle(rotation));
      ctx.translate(-image.width / 2, -image.height / 2);
      ctx.drawImage(image, 0, 0);

      const data = ctx.getImageData(
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.putImageData(data, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'croppedImage.jpg', { type: 'image/jpeg' });
        resolve(file); // Return the file object
      }, 'image/jpeg');
    } catch (error) {
      reject(error);
    }
  });
};
