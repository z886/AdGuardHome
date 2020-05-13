import React from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';

const SearchLink = (props) => {
    const { pathname = '/logs', children, search = '' } = props;

    const searchValue = !search && typeof children === 'string' ? children : search;

    return <Link className='text-inherit' to={{
        pathname,
        params: { search: `"${searchValue}"` },
    }}>
        {children}
    </Link>;
};

SearchLink.propTypes = {
    pathname: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.number,
        PropTypes.element]).isRequired,
    search: PropTypes.string,
};

export default SearchLink;
