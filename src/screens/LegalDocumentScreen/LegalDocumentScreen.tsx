import React, { Fragment } from 'react';

import type { AppTheme } from '../../theme/theme';
import type { LegalBlock, LegalDocument, LegalSpan } from '../../lib/interfaces/legal.interface.ts';
import { Linking, ScrollView, View } from 'react-native';

import { EdgeSwipeBack } from '../../components/EdgeSwipeBack/EdgeSwipeBack';
import { Hero } from '../../components/Hero/Hero';
import { Icon } from '../../components/Icon/Icon';
import { Text } from '../../components/Text/Text';
import { TopBar } from '../../components/TopBar/TopBar';
import { isPrivacyPolicyLabel } from '../../lib/utils/legalMarkdown.utils.ts';

import styles from './LegalDocumentScreen.styles';

interface LegalDocumentScreenProps {
    theme: AppTheme;
    document: LegalDocument;
    onBack: VoidFunction;
    onToggleTheme: VoidFunction;
    onOpenPrivacyPolicy?: VoidFunction;
}

const openHref = (href: string): void => {
    void Linking.openURL(href).catch(() => undefined);
};

const isCodeExample = (lines: LegalSpan[][]): boolean =>
    lines.length === 1 && lines[0]?.length === 1 && lines[0][0]?.type === 'code';

const isEffectiveDate = (lines: LegalSpan[][]): boolean =>
    lines.length === 1 &&
    lines[0]?.length === 1 &&
    lines[0][0]?.type === 'bold' &&
    (lines[0][0]?.value.startsWith('Fecha de entrada en vigor:') ?? false);

interface InlineProps {
    theme: AppTheme;
    spans: LegalSpan[];
    onOpenPrivacyPolicy?: VoidFunction;
}

const InlineText: React.FC<InlineProps> = (props) => {
    const { theme, spans, onOpenPrivacyPolicy } = props;

    return (
        <>
            {spans.map((span, index) => {
                if (span.type === 'bold') {
                    if (onOpenPrivacyPolicy && isPrivacyPolicyLabel(span.value)) {
                        return (
                            <Text
                                key={`${span.type}-${index}`}
                                accessibilityRole="link"
                                onPress={onOpenPrivacyPolicy}
                                style={[styles.link, { color: theme.colors.text }]}
                            >
                                {span.value}
                            </Text>
                        );
                    }

                    return (
                        <Text key={`${span.type}-${index}`} style={styles.bold}>
                            {span.value}
                        </Text>
                    );
                }

                if (span.type === 'code') {
                    return (
                        <Text key={`${span.type}-${index}`} style={styles.code}>
                            {span.value}
                        </Text>
                    );
                }

                if (span.type === 'link') {
                    return (
                        <Text
                            key={`${span.type}-${index}`}
                            accessibilityRole="link"
                            onPress={() => openHref(span.href)}
                            style={[styles.link, { color: theme.colors.text }]}
                        >
                            {span.value}
                        </Text>
                    );
                }

                return <Fragment key={`${span.type}-${index}`}>{span.value}</Fragment>;
            })}
        </>
    );
};

interface BlockLinesProps {
    theme: AppTheme;
    lines: LegalSpan[][];
    onOpenPrivacyPolicy?: VoidFunction;
}

const BlockLines: React.FC<BlockLinesProps> = (props) => {
    const { theme, lines, onOpenPrivacyPolicy } = props;

    return (
        <>
            {lines.map((spans, index) => (
                <Fragment key={`line-${index}`}>
                    {index > 0 ? '\n' : null}
                    <InlineText
                        theme={theme}
                        spans={spans}
                        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
                    />
                </Fragment>
            ))}
        </>
    );
};

interface BlockProps {
    theme: AppTheme;
    block: LegalBlock;
    onOpenPrivacyPolicy?: VoidFunction;
}

const DocumentBlock: React.FC<BlockProps> = (props) => {
    const { theme, block, onOpenPrivacyPolicy } = props;

    if (block.type === 'title') {
        return (
            <Text
                accessibilityRole="header"
                selectable
                style={[styles.title, { color: theme.colors.text }]}
            >
                {block.text}
            </Text>
        );
    }

    if (block.type === 'heading') {
        return (
            <Text
                accessibilityRole="header"
                selectable
                style={[styles.heading, { color: theme.colors.text }]}
            >
                {block.text}
            </Text>
        );
    }

    if (block.type === 'rule') {
        return <View style={[styles.rule, { backgroundColor: theme.colors.border }]} />;
    }

    if (block.type === 'list') {
        return (
            <View style={styles.list}>
                {block.items.map((spans, index) => (
                    <View key={`item-${index}`} style={styles.listItem}>
                        <Text style={[styles.bullet, { color: theme.colors.textMuted }]}>•</Text>
                        <Text
                            selectable
                            style={[styles.listBody, { color: theme.colors.textMuted }]}
                        >
                            <InlineText
                                theme={theme}
                                spans={spans}
                                onOpenPrivacyPolicy={onOpenPrivacyPolicy}
                            />
                        </Text>
                    </View>
                ))}
            </View>
        );
    }

    if (block.type === 'quote') {
        return (
            <View style={[styles.quote, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text selectable style={[styles.quoteText, { color: theme.colors.textMuted }]}>
                    <BlockLines
                        theme={theme}
                        lines={block.lines}
                        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
                    />
                </Text>
            </View>
        );
    }

    if (isCodeExample(block.lines)) {
        const value = block.lines[0]?.[0]?.value ?? '';

        return (
            <View style={[styles.example, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text selectable style={[styles.exampleText, { color: theme.colors.text }]}>
                    {value}
                </Text>
            </View>
        );
    }

    const dateLine = isEffectiveDate(block.lines);

    return (
        <Text
            selectable
            style={[
                dateLine ? styles.meta : styles.body,
                { color: dateLine ? theme.colors.textMuted : theme.colors.text },
            ]}
        >
            <BlockLines
                theme={theme}
                lines={block.lines}
                onOpenPrivacyPolicy={onOpenPrivacyPolicy}
            />
        </Text>
    );
};

export const LegalDocumentScreen: React.FC<LegalDocumentScreenProps> = (props) => {
    const { theme, document, onBack, onToggleTheme, onOpenPrivacyPolicy } = props;

    return (
        <EdgeSwipeBack onBack={onBack}>
            <View style={[styles.safe, { backgroundColor: theme.colors.background }]}>
                <Hero theme={theme} compact>
                    <TopBar
                        theme={theme}
                        onBack={onBack}
                        title={document.shortTitle}
                        onToggleTheme={onToggleTheme}
                        onPrimary
                    />
                </Hero>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
                    <View style={[styles.symbol, { backgroundColor: theme.colors.primary }]}>
                        <Icon name={document.icon} size={29} color={theme.colors.onPrimary} />
                    </View>
                    {document.blocks.map((block, index) => (
                        <DocumentBlock
                            key={`${block.type}-${index}`}
                            theme={theme}
                            block={block}
                            onOpenPrivacyPolicy={onOpenPrivacyPolicy}
                        />
                    ))}
                </ScrollView>
            </View>
        </EdgeSwipeBack>
    );
};
