import type { ImageProps } from 'next/image';
import Image from 'next/image';
import type { FC } from 'react';
import { useState } from 'react';
import { unknownImage } from '../../constants';
import type { NullableBy } from '../../utils/types';

const ImageWithFallback: FC<NullableBy<ImageProps, 'src'>> = (props) => {
  const { src, alt = '', ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  return <Image {...rest} alt={alt} src={imgSrc ?? unknownImage} onError={() => setImgSrc(unknownImage)} />;
};

export default ImageWithFallback;
