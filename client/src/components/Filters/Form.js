import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Trans, withTranslation } from 'react-i18next';
import flow from 'lodash/flow';

import {
    renderInputField, required, isValidPath, renderSelectField,
} from '../../helpers/form';
import { MODAL_OPEN_TIMEOUT, MODAL_TYPE } from '../../helpers/constants';

const renderFilters = (filtersCatalog, selectedSources, t) => Object.entries(filtersCatalog)
    .map(([categoryName, listObj]) => <div key={categoryName} className="modal-body__item">
                <h6 className="form__label form__label--with-desc form__label--bold pb-2">
                    <Trans>{categoryName}</Trans></h6>
                {Object.entries(listObj)
                    .map(([listName, { homepage, source }]) => {
                        const isSelected = Object.prototype
                            .hasOwnProperty.call(selectedSources, source);

                        return <div key={listName} className="d-flex align-items-center">
                            <Field
                                name={listName}
                                type="checkbox"
                                component={renderSelectField}
                                placeholder={t(listName)}
                                disabled={isSelected}
                            />
                            <a href={homepage} className="ml-1 d-flex align-items-center">
                                <svg className="nav-icon">
                                    <use xlinkHref='#dashboard' />
                                </svg>
                            </a>
                            <a href={source} className="d-flex align-items-center">
                                <svg className="nav-icon">
                                    <use xlinkHref='#setup' />
                                </svg>
                            </a>
                        </div>;
                    })}
            </div>);

const Form = (props) => {
    const {
        t,
        closeModal,
        handleSubmit,
        processingAddFilter,
        processingConfigFilter,
        whitelist,
        modalType,
        toggleFilteringModal,
        selectedSources,
        filtersCatalog,
    } = props;

    const openModal = (modalType, timeout = MODAL_OPEN_TIMEOUT) => {
        toggleFilteringModal();
        setTimeout(() => toggleFilteringModal({ type: modalType }), timeout);
    };

    const openFilteringListModal = () => openModal(MODAL_TYPE.CHOOSE_FILTERING_LIST);

    const openAddFiltersModal = () => openModal(MODAL_TYPE.ADD_FILTERS);

    return (
        <form onSubmit={handleSubmit}>
            <div className="modal-body modal-body--medium">
                {modalType === MODAL_TYPE.SELECT_MODAL_TYPE
                && <div className="d-flex justify-content-around">
                    <button onClick={openFilteringListModal}
                            className="btn btn-success btn-standard mr-2 btn-large">
                        Choose from a list
                    </button>
                    <button onClick={openAddFiltersModal} className="btn btn-primary btn-standard">
                        Add a custom list
                    </button>
                </div>}
                {modalType === MODAL_TYPE.CHOOSE_FILTERING_LIST
                && renderFilters(filtersCatalog, selectedSources, t)}
                {modalType !== MODAL_TYPE.CHOOSE_FILTERING_LIST
                && modalType !== MODAL_TYPE.SELECT_MODAL_TYPE && <Fragment>
                    <div className="form__group">
                        <Field
                            id="name"
                            name="name"
                            type="text"
                            component={renderInputField}
                            className="form-control"
                            placeholder={t('enter_name_hint')}
                            validate={[required]}
                            normalizeOnBlur={(data) => data.trim()} />
                    </div>
                    <div className="form__group">
                        <Field
                            id="url"
                            name="url"
                            type="text"
                            component={renderInputField}
                            className="form-control"
                            placeholder={t('enter_url_or_path_hint')}
                            validate={[required, isValidPath]}
                            normalizeOnBlur={(data) => data.trim()} />
                    </div>
                    <div className="form__description">
                        {whitelist ? <Trans>enter_valid_allowlist</Trans>
                            : <Trans>enter_valid_blocklist</Trans>}
                    </div>
                </Fragment>}
            </div>
            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                >
                    <Trans>cancel_btn</Trans>
                </button>
                <button
                    type="submit"
                    className="btn btn-success"
                    disabled={processingAddFilter || processingConfigFilter}
                >
                    <Trans>save_btn</Trans>
                </button>
            </div>
        </form>
    );
};

Form.propTypes = {
    t: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    processingAddFilter: PropTypes.bool.isRequired,
    processingConfigFilter: PropTypes.bool.isRequired,
    whitelist: PropTypes.bool,
    modalType: PropTypes.string.isRequired,
    toggleFilteringModal: PropTypes.func.isRequired,
    filtersCatalog: PropTypes.object,
    selectedSources: PropTypes.object,
};

export default flow([
    withTranslation(),
    reduxForm({
        form: 'filterForm',
    }),
])(Form);
