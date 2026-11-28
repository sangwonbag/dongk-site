import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const fields = [
  { key: 'businessNumber', column: 'business_number', label: '사업자등록번호', required: true, maxLength: 12, placeholder: '123-45-67890' },
  { key: 'businessName', column: 'business_name', label: '상호 / 법인명', required: true, maxLength: 120 },
  { key: 'representative', column: 'representative', label: '대표자명', required: true, maxLength: 80 },
  { key: 'openedOn', column: 'opened_on', label: '개업연월일', required: true, type: 'date' },
  { key: 'address', column: 'business_address', label: '사업장 소재지', maxLength: 250 },
  { key: 'businessType', column: 'business_type', label: '업태', maxLength: 120 },
  { key: 'businessItem', column: 'business_item', label: '종목', maxLength: 120 }
];

export default function BusinessVerification({ userId }) {
  const [form, setForm] = useState({});
  const [verifiedAt, setVerifiedAt] = useState(null);
  const [access, setAccess] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || session.user.id !== userId) {
          if (active) setAccess('legacy');
          return;
        }
        const { data, error: queryError } = await supabase.from('business_verifications')
          .select('business_number,business_name,representative,opened_on,business_address,business_type,business_item,verified_at')
          .eq('user_id', userId)
          .maybeSingle();
        if (queryError) throw queryError;
        if (!active) return;
        if (data) {
          setForm(Object.fromEntries(fields.map(({ key, column }) => [key, data[column] ?? ''])));
          setVerifiedAt(data.verified_at);
        }
        setAccess('ready');
      } catch {
        if (active) setAccess('unavailable');
      }
    }
    void load();
    return () => { active = false; };
  }, [userId]);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== userId) throw new Error('로그인 세션을 확인할 수 없습니다.');
      const response = await fetch('/api/business-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok || !result.verifiedAt) throw new Error(result.message || '사업자 인증을 완료하지 못했습니다.');
      setVerifiedAt(result.verifiedAt);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mypage-section" aria-labelledby="business-verification-title">
      <h2 className="section-title" id="business-verification-title">사업자 등록정보</h2>
      <div className="info-card">
        {access === 'loading' && <p role="status">사업자 정보를 불러오는 중입니다.</p>}
        {access === 'legacy' && <p>현재 로그인 방식은 사업자 인증에 필요한 계정 확인을 지원하지 않습니다. 고객센터에 문의해 주세요.</p>}
        {access === 'unavailable' && <p role="alert">사업자 정보를 불러올 수 없습니다. 잠시 후 새로고침해 주세요.</p>}
        {access === 'ready' && (
          <form onSubmit={submit}>
            <p>등록증에 적힌 사업자등록번호, 상호, 대표자명, 개업연월일을 입력해 주세요.</p>
            {fields.map(({ key, label, required, maxLength, placeholder, type }) => (
              <div className="info-row" key={key}>
                <label className="info-label" htmlFor={'business-' + key}>{label}{required ? ' (필수)' : ''}</label>
                <input
                  required={required}
                  maxLength={maxLength}
                  placeholder={placeholder}
                  type={type ?? 'text'}
                  id={'business-' + key}
                  className="info-value"
                  pattern={key === 'businessNumber' ? '[0-9]{10}|[0-9]{3}-[0-9]{2}-[0-9]{5}' : undefined}
                  value={form[key] ?? ''}
                  onChange={event => {
                    const value = event.target.value;
                    setForm(current => ({ ...current, [key]: value }));
                    setVerifiedAt(null);
                    setError('');
                  }}
                  disabled={saving}
                />
              </div>
            ))}
            <button type="submit" className="btn-go-estimate mt-2" disabled={saving || Boolean(verifiedAt)}>
              {saving ? '인증 확인 중…' : verifiedAt ? '인증 완료' : '사업자 인증하기'}
            </button>
            {verifiedAt && <p role="status">국세청 사업자 정보 확인이 완료되었습니다.</p>}
            {error && <p role="alert">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
