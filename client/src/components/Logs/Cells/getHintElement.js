import React, { Fragment } from 'react';
import nanoid from 'nanoid';
import PropTypes from 'prop-types';

const getHintElement = ({
    className,
    dataTip,
    xlinkHref,
    tooltipComponent,
}) => {
    const id = nanoid();

    return <Fragment>
        <svg className={className} data-tip={dataTip} data-for={dataTip ? id : undefined}>
            <use xlinkHref={`#${xlinkHref}`} />
        </svg>
        {dataTip && tooltipComponent({ id })}
    </Fragment>;
};

getHintElement.propTypes = {
    className: PropTypes.string,
    dataTip: PropTypes.string,
    xlinkHref: PropTypes.string.isRequired,
    tooltipComponent: PropTypes.element.isRequired,
};

export default getHintElement;
