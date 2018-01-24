import React from 'react';
import './styles.css';

const ImagePlaceholder = ({ src, style, imgClass }) => (
  <div className={`top-img-container ${imgClass}`} style={style}>
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundImage: `url(${src})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    />
  </div>
);

export default ImagePlaceholder;
