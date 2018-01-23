import React, { PureComponent } from 'react';
import { Image } from 'semantic-ui-react';
import topImgPlaceholder from '../../assets/placeholder/top-img-placeholder.png';

class ImageErrorPlaceholder extends PureComponent {
  state = { tempImageUrl: '' }
  handleImgError = () => {
    this.setState({ tempImageUrl: topImgPlaceholder });
  }

  render() {
    const { src } = this.props;
    const { tempImageUrl } = this.state;

    return (
      <Image
        src={tempImageUrl || src || topImgPlaceholder}
        onError={() => this.handleImgError()}
      />
    );
  }
}

export default ImageErrorPlaceholder;
