'use client';

import { Box, IconButton, TextField, Typography, useTheme } from '@mui/material';
import { Add, Minus } from 'iconsax-react';
import { useCallback, useState, useEffect } from 'react';

export interface NumberStepperProps {
    /** Current value */
    value: number;
    /** Callback when value changes */
    onChange: (value: number) => void;
    /** Minimum allowed value */
    min?: number;
    /** Maximum allowed value */
    max?: number;
    /** Step increment/decrement */
    step?: number;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Disable the stepper */
    disabled?: boolean;
    /** Show input field between buttons */
    showInput?: boolean;
    /** Label above the stepper */
    label?: string;
    /** Custom width */
    width?: string | number;
    /** Format display value (for display only, not input) */
    formatValue?: (value: number) => string;
    /** Prefix for display (e.g., "฿") */
    prefix?: string;
    /** Suffix for display (e.g., "ชิ้น") */
    suffix?: string;
    /** Allow decimal values */
    allowDecimal?: boolean;
    /** Decimal places */
    decimalPlaces?: number;
}

const sizeConfig = {
    sm: {
        buttonSize: 28,
        iconSize: 16,
        fontSize: '0.875rem',
        inputWidth: 50,
        gap: 4,
    },
    md: {
        buttonSize: 36,
        iconSize: 20,
        fontSize: '1rem',
        inputWidth: 60,
        gap: 6,
    },
    lg: {
        buttonSize: 44,
        iconSize: 24,
        fontSize: '1.125rem',
        inputWidth: 80,
        gap: 8,
    },
};

export default function NumberStepper({
    value,
    onChange,
    min = 0,
    max = Infinity,
    step = 1,
    size = 'md',
    disabled = false,
    showInput = true,
    label,
    width,
    formatValue,
    prefix = '',
    suffix = '',
    allowDecimal = false,
    decimalPlaces = 2,
}: NumberStepperProps) {
    const theme = useTheme();
    const config = sizeConfig[size];
    const [inputValue, setInputValue] = useState(value.toString());
    const [isFocused, setIsFocused] = useState(false);

    // Sync inputValue with value prop
    useEffect(() => {
        if (!isFocused) {
            setInputValue(allowDecimal ? value.toFixed(decimalPlaces) : value.toString());
        }
    }, [value, isFocused, allowDecimal, decimalPlaces]);

    const clampValue = useCallback(
        (val: number): number => {
            const clamped = Math.max(min, Math.min(max, val));
            return allowDecimal ? Number(clamped.toFixed(decimalPlaces)) : Math.round(clamped);
        },
        [min, max, allowDecimal, decimalPlaces]
    );

    const handleIncrement = useCallback(() => {
        if (disabled) return;
        const newValue = clampValue(value + step);
        onChange(newValue);
    }, [value, step, disabled, clampValue, onChange]);

    const handleDecrement = useCallback(() => {
        if (disabled) return;
        const newValue = clampValue(value - step);
        onChange(newValue);
    }, [value, step, disabled, clampValue, onChange]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            // Allow empty, numbers, and decimal point if allowDecimal
            if (allowDecimal) {
                if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                    setInputValue(val);
                }
            } else {
                if (val === '' || /^-?\d*$/.test(val)) {
                    setInputValue(val);
                }
            }
        },
        [allowDecimal]
    );

    const handleInputBlur = useCallback(() => {
        setIsFocused(false);
        const parsed = parseFloat(inputValue);
        if (!isNaN(parsed)) {
            const clamped = clampValue(parsed);
            onChange(clamped);
            setInputValue(allowDecimal ? clamped.toFixed(decimalPlaces) : clamped.toString());
        } else {
            setInputValue(allowDecimal ? value.toFixed(decimalPlaces) : value.toString());
        }
    }, [inputValue, clampValue, onChange, value, allowDecimal, decimalPlaces]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                handleIncrement();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                handleDecrement();
            } else if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
            }
        },
        [handleIncrement, handleDecrement]
    );

    const displayValue = formatValue ? formatValue(value) : `${prefix}${allowDecimal ? value.toFixed(decimalPlaces) : value}${suffix}`;

    const isMinReached = value <= min;
    const isMaxReached = value >= max;

    return (
        <Box sx={{ width: width || 'auto' }}>
            {label && (
                <Typography
                    variant="body2"
                    sx={{
                        mb: 0.5,
                        fontWeight: 500,
                        color: disabled ? 'text.disabled' : 'text.secondary',
                    }}
                >
                    {label}
                </Typography>
            )}
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: `${config.gap}px`,
                    bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: disabled ? 'action.disabled' : 'divider',
                    p: 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: disabled ? 'action.disabled' : 'primary.main',
                    },
                }}
            >
                {/* Decrement Button */}
                <IconButton
                    onClick={handleDecrement}
                    disabled={disabled || isMinReached}
                    size="small"
                    sx={{
                        width: config.buttonSize,
                        height: config.buttonSize,
                        bgcolor: isMinReached || disabled ? '#F5F5F5' : '#FFF0F2',
                        color: isMinReached || disabled ? '#CCC' : '#B76E79',
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: isMinReached || disabled ? '#E0E0E0' : '#F5D0D6',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: '#B76E79',
                            color: '#FFF',
                            borderColor: '#B76E79',
                            transform: 'scale(1.05)',
                        },
                        '&:active': {
                            transform: 'scale(0.95)',
                        },
                    }}
                >
                    <Minus size={config.iconSize} color="currentColor" />
                </IconButton>

                {/* Value Display / Input */}
                {showInput ? (
                    <TextField
                        value={isFocused ? inputValue : displayValue}
                        onChange={handleInputChange}
                        onFocus={() => {
                            setIsFocused(true);
                            setInputValue(allowDecimal ? value.toFixed(decimalPlaces) : value.toString());
                        }}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        disabled={disabled}
                        size="small"
                        inputProps={{
                            style: {
                                textAlign: 'center',
                                fontSize: config.fontSize,
                                fontWeight: 600,
                                padding: '4px 0',
                                width: config.inputWidth,
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    border: 'none',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: disabled ? 'text.disabled' : 'text.primary',
                            },
                        }}
                    />
                ) : (
                    <Typography
                        sx={{
                            minWidth: config.inputWidth,
                            textAlign: 'center',
                            fontSize: config.fontSize,
                            fontWeight: 600,
                            color: disabled ? 'text.disabled' : 'text.primary',
                            userSelect: 'none',
                        }}
                    >
                        {displayValue}
                    </Typography>
                )}

                {/* Increment Button */}
                <IconButton
                    onClick={handleIncrement}
                    disabled={disabled || isMaxReached}
                    size="small"
                    sx={{
                        width: config.buttonSize,
                        height: config.buttonSize,
                        bgcolor: isMaxReached || disabled ? '#F5F5F5' : '#FFF0F2',
                        color: isMaxReached || disabled ? '#CCC' : '#B76E79',
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: isMaxReached || disabled ? '#E0E0E0' : '#F5D0D6',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: '#B76E79',
                            color: '#FFF',
                            borderColor: '#B76E79',
                            transform: 'scale(1.05)',
                        },
                        '&:active': {
                            transform: 'scale(0.95)',
                        },
                    }}
                >
                    <Add size={config.iconSize} color="currentColor" />
                </IconButton>
            </Box>

            {/* Min/Max indicator */}
            {(isMinReached || isMaxReached) && (
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 0.5,
                        color: 'text.disabled',
                        fontSize: '0.7rem',
                    }}
                >
                    {isMinReached && min !== -Infinity && `ขั้นต่ำ: ${prefix}${min}${suffix}`}
                    {isMaxReached && max !== Infinity && `สูงสุด: ${prefix}${max}${suffix}`}
                </Typography>
            )}
        </Box>
    );
}
