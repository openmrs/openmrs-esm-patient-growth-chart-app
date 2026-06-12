import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, RadioButtonGroup, RadioButton, Layer } from '@carbon/react';
import { getCoreTranslation } from '@openmrs/esm-framework';
import { getGenderTranslation } from '../growth-chart/growth-chart.utils';
import styles from './unknown-gender.scss';

interface UnknownGenderStateProps {
  onGenderSelected: (gender: string) => void;
}

const UnknownGenderState: React.FC<UnknownGenderStateProps> = ({ onGenderSelected }) => {
  const { t } = useTranslation();
  const [selectedGender, setSelectedGender] = useState<string>();

  const handleGenderChange = (value: string | number | undefined) => {
    if (value !== undefined) {
      const genderStr = value.toString();
      setSelectedGender(genderStr);
      onGenderSelected(genderStr);
    }
  };

  return (
    <div className={styles.tileContainer}>
      <Layer>
        <Tile className={styles.tile}>
          <div className={styles.tileContent}>
            <p className={styles.content}>{t('noGrowthChartsToDisplay', 'No Growth charts to display')}</p>
            <p className={styles.helper}>
              {t('unknownGender', 'The patient is unknown/other gender')}
              <br />
              {t('growthChartsAvailability', 'Growth charts are only available for male and female patients')}
              <br />
              {t('proceedSelectingGender', 'You can proceed by selecting one of the available genders')}
            </p>

            <div className={styles.radioGroup}>
              <RadioButtonGroup name="gender-selection" valueSelected={selectedGender} onChange={handleGenderChange}>
                <RadioButton value="male" id="male" labelText={getGenderTranslation('male')} />
                <RadioButton value="female" id="female" labelText={getGenderTranslation('female')} />
              </RadioButtonGroup>
            </div>
          </div>
        </Tile>
      </Layer>
    </div>
  );
};

export default UnknownGenderState;
