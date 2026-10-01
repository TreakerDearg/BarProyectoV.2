// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — NInput
// Input del sistema Nocturne Gastronomy.
// Label exterior, borde gold en foco, toggle show/hide para passwords.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors }     from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

interface NInputProps {
  label?:          string;
  placeholder?:    string;
  value:           string;
  onChangeText:    (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?:   'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?:   string;
  error?:          string;
  multiline?:      boolean;
  numberOfLines?:  number;
  maxLength?:      number;
  editable?:       boolean;
  returnKeyType?:  'done' | 'next' | 'search' | 'send' | 'go';
  onSubmitEditing?: () => void;
  containerStyle?: ViewStyle;
  inputRef?:       React.RefObject<TextInput>;
}

export function NInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType    = 'default',
  autoCapitalize  = 'sentences',
  autoComplete,
  error,
  multiline       = false,
  numberOfLines   = 1,
  maxLength,
  editable        = true,
  returnKeyType,
  onSubmitEditing,
  containerStyle,
  inputRef,
}: NInputProps) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isSecret = secureTextEntry && !showPass;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[
        styles.inputWrap,
        focused && styles.inputWrapFocused,
        !!error && styles.inputWrapError,
        !editable && styles.inputWrapDisabled,
      ]}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            multiline && { minHeight: numberOfLines * 44, textAlignVertical: 'top' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline}
          secureTextEntry={isSecret}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete as any}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPass((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            accessibilityLabel={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPass
              ? <EyeOff size={18} color={Colors.onSurfaceVariant} />
              : <Eye    size={18} color={Colors.onSurfaceVariant} />
            }
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.labelSm,
    color:        Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  Colors.surfaceContainer,    // #1d2027
    borderRadius:     Radius.md,
    borderWidth:      1,
    borderColor:      'rgba(224, 226, 236, 0.12)',
    paddingHorizontal: Spacing.md,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,  // #f3be59
  },
  inputWrapError: {
    borderColor: Colors.error,
  },
  inputWrapDisabled: {
    opacity: 0.5,
  },
  input: {
    flex:       1,
    ...Typography.bodyMd,
    color:      Colors.onSurface,
    paddingVertical: Spacing.smMd,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    ...Typography.bodySm,
    color: Colors.error,
  },
});
