import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { withNamespaces, Trans } from 'react-i18next';
import flow from 'lodash/flow';

import { RESPONSE_FILTER } from '../../../helpers/constants';
import Tooltip from '../../ui/Tooltip';

const renderFilterField = ({
    input,
    id,
    className,
    placeholder,
    type,
    disabled,
    autoComplete,
    tooltip,
    meta: { touched, error },
}) => (
    <Fragment>
        <div className="input-group-search">
            <svg className="icons icon--small icon-gray">
                <use xlinkHref="#magnifier" />
            </svg>
        </div>
        <input
            {...input}
            id={id}
            placeholder={placeholder}
            type={type}
            className={className}
            disabled={disabled}
            autoComplete={autoComplete}
            aria-label={placeholder} />
        <span className="logs__notice">
                <Tooltip text={tooltip} type='tooltip-custom--logs' />
            </span>
        {!disabled &&
        touched &&
        (error && <span className="form__message form__message--error">{error}</span>)}
    </Fragment>
);

const Form = (props) => {
    const {
        t,
        handleChange,
        className,
        responseStatusClass,
    } = props;

    return (
        <form onSubmit={handleChange}>
            <div className="input-group">
                <Field
                    id="search"
                    name="search"
                    component={renderFilterField}
                    type="text"
                    className={`form-control--search form-control--transparent ${className}`}
                    placeholder="Domain or client"
                    tooltip={t('query_log_strict_search')}
                    onChange={handleChange}
                />
                <Field
                    name="response_status"
                    component="select"
                    className={`form-control custom-select form-control--transparent ${responseStatusClass}`}
                >
                    <option value="">
                        <Trans>show_all_responses</Trans>
                    </option>
                    <option value={RESPONSE_FILTER.BLOCKED}>
                        <Trans>show_blocked_responses</Trans>
                    </option>
                    <option value={RESPONSE_FILTER.PROCESSED}>
                        <Trans>show_processed_responses</Trans>
                    </option>
                    <option value={RESPONSE_FILTER.WHITELISTED}>
                        <Trans>show_whitelisted_responses</Trans>
                    </option>
                </Field>
            </div>
        </form>
    );
};

Form.propTypes = {
    handleChange: PropTypes.func,
    className: PropTypes.string,
    responseStatusClass: PropTypes.string,
    t: PropTypes.func.isRequired,
};

export default flow([
    withNamespaces(),
    reduxForm({
        form: 'logsFilterForm',
    }),
])(Form);
