import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Message, Divider, LabeledInput, Tooltip } from 'oskari-ui';
import { LocalizationComponent } from 'oskari-ui/components/LocalizationComponent';
import { LocaleProvider, ThemeConsumer, ThemeProvider } from 'oskari-ui/util';
import { SecondaryButton, PrimaryButton, ButtonContainer } from 'oskari-ui/components/buttons';
import { showPopup } from 'oskari-ui/components/window';
import { StyleEditor } from 'oskari-ui/components/StyleEditor';
import { OSKARI_BLANK_STYLE } from 'oskari-ui/components/StyleEditor/index';
import { LOCALE_KEY, LAYER_FORM } from './constants';

const Content = styled.div`
    padding: 24px;
    width: 500px;
`;

const MyPlacesLayerForm = ThemeConsumer(({ theme, locale: initLocale, style: initStyle, onSave, onCancel }) => {
    const defaultStyle = {
        ...OSKARI_BLANK_STYLE,
        fill: {
            ...OSKARI_BLANK_STYLE.fill,
            color: theme.color.primary
        },
        image: {
            ...OSKARI_BLANK_STYLE.image,
            fill: {
                ...OSKARI_BLANK_STYLE.image.fill,
                color: theme.color.primary
            }
        }
    };
    const [editorState, setEditorState] = useState({
        style: initStyle || defaultStyle,
        locale: initLocale || {}
    });
    const { locale, style } = editorState;
    const updateStyle = (style) => setEditorState({ ...editorState, style });
    const updateLocale = (locale) => setEditorState({ ...editorState, locale });

    const defaultLang = Oskari.getDefaultLanguage();
    const hasName = Oskari.util.keyExists(locale, `${defaultLang}.name`) && locale[defaultLang].name.trim().length > 0;

    const placeholder = Oskari.getMsg(LOCALE_KEY, 'categoryform.layerName');
    return (
        <Content>
            <LocalizationComponent
                value={ locale }
                languages={ Oskari.getSupportedLanguages() }
                onChange={ updateLocale }
            >
                <LabeledInput type='text' name='name' label={placeholder} minimal={true} mandatory={true} />
            </LocalizationComponent>
            <Divider orientation="left"><Message messageKey={ 'categoryform.styleTitle' } /></Divider>
            <StyleEditor
                oskariStyle={ style }
                onChange={ updateStyle }
            />
            <ButtonContainer>
                <SecondaryButton type='cancel' onClick={onCancel}/>
                <Tooltip key="okButtonTooltip" title={!hasName && <Message messageKey='categoryform.validation.mandatoryName' /> }>
                    <PrimaryButton disabled={!hasName} type='save' onClick={() => onSave(locale, style) }/>
                </Tooltip>
            </ButtonContainer>
        </Content>
    );
});

MyPlacesLayerForm.propTypes = {
    locale: PropTypes.object,
    style: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};
export const showLayerPopup = (locale, style, saveLayer, onClose) => {
    return showPopup(
        <Message messageKey={ 'categoryform.title' } bundleKey = {LOCALE_KEY}/>,
        (<LocaleProvider value={{ bundleKey: LOCALE_KEY }}>
            <ThemeProvider>
                <MyPlacesLayerForm style={style} locale={locale} onSave={saveLayer} onCancel={onClose}/>
            </ThemeProvider>
        </LocaleProvider>),
        onClose,
        { id: LAYER_FORM }
    );
};
