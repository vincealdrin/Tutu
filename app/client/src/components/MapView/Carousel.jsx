import React, { Component } from 'react';
import { Button, Icon } from 'semantic-ui-react';
import shortid from 'shortid';
import './styles.css';

class CarouselLeftArrow extends Component {
  render() {
    return (
      <Button
        className="carousel-arrow carousel-arrow-left"
        onClick={this.props.onClick}
      >
        <Icon name="chevron left" />
      </Button>
    );
  }
}

class CarouselRightArrow extends Component {
  render() {
    return (
      <Button
        className="carousel-arrow carousel-arrow-right"
        onClick={this.props.onClick}
      >
        <Icon name="chevron right" />
      </Button>
    );
  }
}

class CarouselSlide extends Component {
  render() {
    const { slide } = this.props;
    return (
      <li
        className={
          this.props.index === this.props.activeIndex
          ? 'carousel-slide carousel-slide-active'
          : 'carousel-slide'
        }
      >
        <p className="carousel-slide-content">
          {slide}
        </p>
      </li>
    );
  }
}

class Carousel extends Component {
  state = {
    activeIndex: 0,
  };

  goToPreviousSlide = () => {
    const { activeIndex } = this.state;
    const { content } = this.props;
    const summaryLength = content.length;
    let index = activeIndex;

    if (index < 1) {
      index = summaryLength;
    }

    --index;

    this.setState({
      activeIndex: index,
    });
  }

  goToNextSlide = () => {
    const { activeIndex } = this.state;
    const { content } = this.props;
    const summaryLength = content.length - 1;
    let index = activeIndex;

    if (index === summaryLength) {
      index = -1;
    }

    ++index;

    this.setState({
      activeIndex: index,
    });
  }

  render() {
    const { content } = this.props;
    const { activeIndex } = this.state;

    return (
      <div className="carousel">
        <ul className="carousel-slides">
          {content && content.map((sum, index) => (
            <CarouselSlide
              key={shortid.generate()}
              index={index}
              activeIndex={activeIndex}
              slide={sum}
            />
            ))}
        </ul>

        <div className="carousel-arrows">
          <CarouselLeftArrow onClick={this.goToPreviousSlide} />
          <CarouselRightArrow onClick={this.goToNextSlide} />
        </div>
      </div>
    );
  }
}

export default Carousel;
