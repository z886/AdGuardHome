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
        <div className="logs__input-wrap">
            <input
                {...input}
                id={id}
                placeholder={placeholder}
                type={type}
                className={className}
                disabled={disabled}
                autoComplete={autoComplete}
            />
            <span className="logs__notice">
                <Tooltip text={tooltip} type='tooltip-custom--logs' />
            </span>
            {!disabled &&
                touched &&
                (error && <span className="form__message form__message--error">{error}</span>)}
        </div>
    </Fragment>
);

const Form = (props) => {
    const {
        t,
        handleChange,
    } = props;

    return (
        <form onSubmit={handleChange}>
            <div className="row">
                <div className="col-6">
                    <Field
                        id="search"
                        name="search"
                        component={renderFilterField}
                        type="text"
                        className="form-control"
                        placeholder="Domain or client"
                        tooltip={t('query_log_strict_search')}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-6">
                    <Field
                        name="response_status"
                        component="select"
                        className="form-control custom-select"
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
            </div>
        </form>
    );
};

Form.propTypes = {
    handleChange: PropTypes.func,
    t: PropTypes.func.isRequired,
};

export default flow([
    withNamespaces(),
    reduxForm({
        form: 'logsFilterForm',
    }),
])(Form);
