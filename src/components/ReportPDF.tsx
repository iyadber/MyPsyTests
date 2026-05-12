import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@alexandernanberg/react-pdf-renderer';
import arabicReshaper from 'arabic-reshaper';

import { amiriBase64 } from '../assets/amiriBase64';

// Register Arabic Font
Font.register({
  family: 'Amiri',
  src: `data:font/truetype;charset=utf-8;base64,${amiriBase64}`
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FAFAFA',
    padding: 24,
    fontFamily: 'Amiri',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#888888',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    color: '#111111',
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  scoreBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 32,
    color: '#f59e0b',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#111111',
    marginBottom: 8,
    textAlign: 'right',
  },
  paragraph: {
    fontSize: 11,
    color: '#444444',
    lineHeight: 1.5,
    textAlign: 'right',
  },
  listItem: {
    flexDirection: 'row-reverse',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#f59e0b',
    marginTop: 5,
    marginLeft: 6,
  },
  listText: {
    fontSize: 11,
    color: '#444444',
    lineHeight: 1.5,
    textAlign: 'right',
    flex: 1,
  },
  alert: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertText: {
    fontSize: 11,
    color: '#EF4444',
    textAlign: 'center',
  }
});

interface ReportPDFProps {
  test: any;
  result: any;
}

// Function to safely remove emojis or unsupported symbols which crash react-pdf without an emoji font
const sanitizeText = (str: string) => {
  if (!str) return '';
  // Allow Arabic, Latin, Numbers, Basic Punctuation. Strip other symbols and emojis.
  return str.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s.,!?'"()\-:;*#]/g, '');
};

// Function to handle mixed text (arabic words reversed, numbers kept straight if possible)
const arReverse = (text: string) => {
  if (!text) return '';
  const cleanText = sanitizeText(text);
  return arabicReshaper.convertArabic(cleanText);
}

export const ReportPDFDocument = ({ test, result }: ReportPDFProps) => {
  const analysis = result.aiAnalysis || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>{arReverse('نتيجة اختبار')}</Text>
          <Text style={styles.headerTitle}>{arReverse(test?.nameAr || 'اختبار مجهول')}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{result.totalScore}</Text>
          </View>
        </View>

        {analysis.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{arReverse('تحليل المساعد الذكي')}</Text>
            <Text style={styles.paragraph}>{arReverse(analysis.summary)}</Text>
          </View>
        )}

        {analysis.strengths && analysis.strengths.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{arReverse('نقاط القوة')}</Text>
            {analysis.strengths.map((s: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.listText}>{arReverse(s)}</Text>
              </View>
            ))}
          </View>
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{arReverse('توصيات عملية')}</Text>
            {analysis.recommendations.map((r: string, i: number) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: '#f97316' }]} />
                <Text style={styles.listText}>{arReverse(r)}</Text>
              </View>
            ))}
          </View>
        )}

        {analysis.specialist_referral?.needed && (
          <View style={styles.alert}>
            <Text style={styles.alertText}>{arReverse(analysis.specialist_referral.reason)}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export const generatePDF = async (test: any, result: any) => {
  const { pdf } = await import('@alexandernanberg/react-pdf-renderer');
  const { Capacitor } = await import('@capacitor/core');
  
  const blob = await pdf(<ReportPDFDocument test={test} result={result} />).toBlob();
  const fileName = `تقرير-${test?.nameAr || 'اختبار'}.pdf`;

  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const { ActionSheet } = await import('@capacitor/action-sheet');
    const { Toast } = await import('@capacitor/toast');

    try {
      // Ask user where to save/share
      const resultAction = await ActionSheet.showActions({
        title: 'تصدير التقرير',
        message: 'كيف تريد حفظ هذا التقرير؟',
        options: [
          {
            title: 'حفظ في ملفات الهاتف (Documents)',
          },
          {
            title: 'إرسال أو مشاركة',
          },
          {
            title: 'إلغاء',
            style: 'CANCEL',
          },
        ],
      });

      if (resultAction.index === 2) return; // User cancelled

      // Helper to convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64 = await base64Promise;

      if (resultAction.index === 0) {
        // Save to Documents
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Documents,
          });
          await Toast.show({
            text: `تم حفظ الملف بنجاح في مجلد المستندات`,
            duration: 'long'
          });
        } catch (err) {
          console.error('Save error:', err);
          await Toast.show({ text: 'فشل حفظ الملف في المستندات' });
        }
      } else if (resultAction.index === 1) {
        // Share
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache, // Use Cache for temporary sharing
        });

        await Share.share({
          title: fileName,
          text: 'تقرير الاختبار النفسي',
          url: savedFile.uri,
          dialogTitle: 'تصدير التقرير',
        });
      }
    } catch (error) {
      console.error('Error handling PDF:', error);
      throw error;
    }
  } else {
    // Web implementation
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
};
