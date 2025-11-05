/**
 * 郵便番号から住所を取得するユーティリティ
 * zipcloud APIを使用（無料）
 */

export interface PostalAddressResult {
    success: boolean;
    data?: {
        prefecture: string;      // 都道府県
        city: string;           // 市区町村
        town: string;           // 町域
        fullAddress: string;    // 都道府県+市区町村+町域の完全な住所
    };
    error?: string;
}

/**
 * 郵便番号から住所を取得
 * @param postalCode 郵便番号（ハイフン有無どちらでも可）
 * @returns 住所情報または空の結果
 */
export async function getAddressFromPostalCode(postalCode: string): Promise<PostalAddressResult> {
    try {
        // 郵便番号を正規化（数字のみにする）
        const normalizedCode = postalCode.replace(/[^\d]/g, "");

        if (normalizedCode.length !== 7) {
            return {
                success: false,
                error: "郵便番号は7桁で入力してください"
            };
        }

        // zipcloud APIに問い合わせ
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${normalizedCode}`);

        if (!response.ok) {
            return {
                success: false,
                error: "住所の取得に失敗しました"
            };
        }

        const result = await response.json();

        if (result.status !== 200) {
            return {
                success: false,
                error: "住所が見つかりませんでした"
            };
        }

        if (!result.results || result.results.length === 0) {
            return {
                success: false,
                error: "該当する住所が見つかりませんでした"
            };
        }

        // 最初の結果を使用
        const addressData = result.results[0];
        const fullAddress = `${addressData.address1}${addressData.address2}${addressData.address3}`;

        return {
            success: true,
            data: {
                prefecture: addressData.address1 || "",
                city: addressData.address2 || "",
                town: addressData.address3 || "",
                fullAddress: fullAddress
            }
        };

    } catch (error) {
        console.error("Postal code lookup error:", error);
        return {
            success: false,
            error: "住所の取得中にエラーが発生しました"
        };
    }
}

/**
 * 郵便番号をフォーマット（123-4567の形式に）
 * @param postalCode 郵便番号
 * @returns フォーマット済み郵便番号
 */
export function formatPostalCode(postalCode: string): string {
    const numbers = postalCode.replace(/[^\d]/g, "");
    if (numbers.length >= 4) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}`;
    }
    return numbers;
}

/**
 * 郵便番号の妥当性をチェック
 * @param postalCode 郵便番号
 * @returns 妥当かどうか
 */
export function isValidPostalCode(postalCode: string): boolean {
    const numbers = postalCode.replace(/[^\d]/g, "");
    return numbers.length === 7;
}
