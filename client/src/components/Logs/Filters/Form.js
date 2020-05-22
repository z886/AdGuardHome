import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
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
}) => <Fragment>
    <div className="input-group-search">
        <svg className="icons icon--small icon--gray">
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
    {!disabled
    && touched
    && (error && <span className="form__message form__message--error">{error}</span>)}
</Fragment>;

renderFilterField.propTypes = {
    input: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    disabled: PropTypes.string,
    autoComplete: PropTypes.string,
    tooltip: PropTypes.string,
    meta: PropTypes.shape({
        touched: PropTypes.bool,
        error: PropTypes.object,
    }).isRequired,
};

const Form = (props) => {
    const {
        t,
        handleChange,
        className = '',
        responseStatusClass,
    } = props;

    return (
        <form className="mw-100 d-flex flex-wrap"
              onSubmit={(e) => {
                  e.preventDefault();
              }}>
            <Field
                id="search"
                name="search"
                component={renderFilterField}
                type="text"
                className={`form-control--search form-control--transparent ${className}`}
                placeholder={t('domain_or_client')}
                tooltip={t('query_log_strict_search')}
                onChange={handleChange}
            />
            <div className="field__select">
                <Field
                    name="response_status"
                    component="select"
                    className={`form-control custom-select custom-select__arrow--left ml-small form-control--transparent ${responseStatusClass}`}
                >
                    <option value="">
                        {t('show_all_responses')}
                    </option>
                    <option value={RESPONSE_FILTER.BLOCKED}>
                        {t('show_blocked_responses')}
                    </option>
                    <option value={RESPONSE_FILTER.PROCESSED}>
                        {t('show_processed_responses')}
                    </option>
                    <option value={RESPONSE_FILTER.WHITELISTED}>
                        {t('show_whitelisted_responses')}
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
    withTranslation(),
    reduxForm({
        form: 'logsFilterForm',
    }),
])(Form);
