/* ============================================================
   HUMANO EDU – edu.js
   Függ: shared_js.js (db, currentUser, showToast, fmtDate, esc)
   Betöltés: teacher.html és student.html is használja
   ============================================================ */

'use strict';

/* ─── 1. KONFIGURÁCIÓ ─────────────────────────────────────── */

const EDU_CONFIG = {
  joinBase:      'https://humano-hu.vercel.app/join',
  inviteExpiry:  30,   // nap
  emailFunction: 'send-email',
};

/* ─── 2. SZEREPKÖR ELLENŐRZÉS ─────────────────────────────── */

async function eduGetRole() {
  if (!currentUser) return null;
  const { data } = await db.from('profiles')
    .select('role, class_id, teacher_id')
    .eq('id', currentUser.id)
    .single();
  return data;
}

async function eduRequireRole(role) {
  const profile = await eduGetRole();
  if (!profile || profile.role !== role) {
    showToast(`❌ Ez az oldal csak ${role === 'teacher' ? 'tanároknak' : 'diákoknak'} elérhető.`);
    window.location.href = '/';
    return false;
  }
  return profile;
}

/* ─── 3. TANÁRI REGISZTRÁCIÓ ──────────────────────────────── */

// Tanári kód ellenőrzése regisztrációkor
/* ─── 3. TANÁRI REGISZTRÁCIÓ ──────────────────────────────── */

// Tanári kód ellenőrzése regisztrációkor
async function teacherCheckCode(code) {
  if (!code) return { valid: false, error: 'Add meg a tanári kódot.' };
  
  const { data, error } = await db
    .from('teacher_codes')
    .select('id, used_by')
    .eq('code', code.trim().toUpperCase())
    .single();
    
  if (error || !data) return { valid: false, error: 'Érvénytelen tanári kód.' };
  if (data.used_by) return { valid: false, error: 'Ez a kód már felhasználásra került.' };
  
  return { valid: true, id: data.id };
}

// Tanári szerepkör beállítása regisztráció után
async function teacherActivate(codeText) {
  if (!currentUser) return false;
  
  const check = await teacherCheckCode(codeText);
  if (!check.valid) {
    showToast('❌ ' + check.error);
    return false;
  }

  // Profil frissítése
  const { error: profileErr } = await db
    .from('profiles')
    .update({ role: 'teacher' })
    .eq('id', currentUser.id);
    
  if (profileErr) {
    showToast('❌ Hiba: ' + profileErr.message);
    return false;
  }

  // Kód megjelölése felhasználtnak
  await db
    .from('teacher_codes')
    .update({ 
      used_by: currentUser.id, 
      used_at: new Date().toISOString() 
    })
    .eq('code', codeText.trim().toUpperCase());

  showToast('✅ Tanári fiók aktiválva!');
  return true;
}

/* ─── 4. OSZTÁLY KEZELÉS ──────────────────────────────────── */

// Osztály létrehozása
async function classCreate(name, description = '') {
  if (!currentUser) return null;
  const code = 'CLS-' + Math.random().toString(36).substring(2, 6).toUpperCase()
             + '-' + Date.now().toString(36).toUpperCase().slice(-4);
  const { data, error } = await db.from('classes')
    .insert({
      teacher_id:  currentUser.id,
      name:        name.trim(),
      description: description.trim() || null,
      code,
    })
    .select()
    .single();
  if (error) { showToast('❌ ' + error.message); return null; }
  showToast('✅ Osztály létrehozva! Kód: ' + code);
  return data;
}

// Tanár osztályainak betöltése
async function classLoadAll() {
  if (!currentUser) return [];
  const { data } = await db.from('teacher_class_overview')
    .select('*')
    .eq('teacher_id', currentUser.id)
    .order('created_at', { ascending: false });
  return data || [];
}

// Osztály törlése
async function classDelete(classId) {
  if (!confirm('Biztosan törlöd az osztályt? Az összes beadás is törlődik.')) return false;
  const { error } = await db.from('classes')
    .delete()
    .eq('id', classId)
    .eq('teacher_id', currentUser.id);
  if (error) { showToast('❌ ' + error.message); return false; }
  showToast('🗑 Osztály törölve.');
  return true;
}

/* ─── 5. MAGIC LINK – MEGHÍVÓ GENERÁLÁS ──────────────────── */

// Osztály szintű meghívó (mindenki ugyanazt kapja)
async function inviteCreateForClass(classId) {
  if (!currentUser) return null;
  const token     = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + EDU_CONFIG.inviteExpiry * 86400000).toISOString();

  const { data, error } = await db.from('student_invites')
    .insert({
      token,
      class_id:   classId,
      teacher_id: currentUser.id,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) { showToast('❌ ' + error.message); return null; }
  return `${EDU_CONFIG.joinBase}?token=${token}`;
}

// Személyre szabott meghívó (egy diáknak)
async function inviteCreatePersonal(classId, studentName, studentEmail = '') {
  if (!currentUser) return null;
  const token     = crypto.randomUUID().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + EDU_CONFIG.inviteExpiry * 86400000).toISOString();

  const { data, error } = await db.from('student_invites')
    .insert({
      token,
      class_id:      classId,
      teacher_id:    currentUser.id,
      student_name:  studentName.trim(),
      student_email: studentEmail.trim() || null,
      expires_at:    expiresAt,
    })
    .select()
    .single();

  if (error) { showToast('❌ ' + error.message); return null; }

  const link = `${EDU_CONFIG.joinBase}?token=${token}`;

  // Ha van email, elküldi automatikusan
  if (studentEmail) {
    await inviteSendEmail(studentEmail, studentName, link);
  }

  return link;
}

// Meghívó emailben elküldése
async function inviteSendEmail(toEmail, studentName, link) {
  try {
    const { data: { session } } = await db.auth.getSession();
    await fetch(`${SUPA_URL}/functions/v1/${EDU_CONFIG.emailFunction}`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        to:      toEmail,
        subject: 'HUMANO – Tanári meghívó',
        type:    'general',
        message: `Kedves ${studentName}!\n\nTanárod meghívott a HUMANO platformra.\n\nKattints az alábbi linkre a belépéshez:\n${link}\n\nA link ${EDU_CONFIG.inviteExpiry} napig érvényes.\n\n– HUMANO csapat`,
      }),
    });
    showToast('📧 Meghívó elküldve: ' + toEmail);
  } catch (err) {
    showToast('⚠️ Email küldési hiba: ' + err.message);
  }
}

// Összes meghívó betöltése egy osztályhoz
async function inviteLoadForClass(classId) {
  const { data } = await db.from('student_invites')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });
  return data || [];
}

/* ─── 6. DIÁK JOIN FLOW ───────────────────────────────────── */

// Token feldolgozása (join oldalon hívódik)
async function studentJoin(token) {
  if (!token) return { ok: false, error: 'Hiányzó token.' };

  // Token ellenőrzése
  const { data: invite, error } = await db.from('student_invites')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !invite)     return { ok: false, error: 'Érvénytelen meghívó link.' };
  if (invite.used_by)       return { ok: false, error: 'Ez a link már felhasználásra került.' };
  if (new Date(invite.expires_at) < new Date())
                            return { ok: false, error: 'A meghívó link lejárt.' };

  return { ok: true, invite };
}

// Diák regisztráció/belépés után a profil beállítása
async function studentActivate(token) {
  if (!currentUser) return false;

  const result = await studentJoin(token);
  if (!result.ok) { showToast('❌ ' + result.error); return false; }

  const invite = result.invite;

  // Profil frissítése
  const updates = {
    role:       'student',
    class_id:   invite.class_id,
    teacher_id: invite.teacher_id,
  };
  if (invite.student_name) updates.username = invite.student_name;

  const { error: profileErr } = await db.from('profiles')
    .update(updates)
    .eq('id', currentUser.id);
  if (profileErr) { showToast('❌ ' + profileErr.message); return false; }

  // Meghívó megjelölése felhasználtnak
  await db.from('student_invites')
    .update({ used_by: currentUser.id, used_at: new Date().toISOString() })
    .eq('token', token);

  showToast('✅ Sikeresen csatlakoztál az osztályhoz!');
  return true;
}

/* ─── 7. BEADÁS ───────────────────────────────────────────── */

// Diák bead egy dokumentumot
async function submissionCreate(docId) {
  if (!currentUser) return null;

  // Profil lekérése (class_id szükséges)
  const { data: profile } = await db.from('profiles')
    .select('role, class_id, username')
    .eq('id', currentUser.id)
    .single();

  if (profile?.role !== 'student') {
    showToast('❌ Csak diákok adhatnak be dolgozatot.');
    return null;
  }
  if (!profile.class_id) {
    showToast('❌ Nem tartozol osztályhoz. Kérj meghívót a tanártól.');
    return null;
  }

  // Dokumentum adatainak lekérése
  const { data: doc } = await db.from('documents')
    .select('process_data, content')
    .eq('doc_id', docId)
    .eq('author_id', currentUser.id)
    .single();

  if (!doc) { showToast('❌ Dokumentum nem található vagy nem a tiéd.'); return null; }

  const wordCount  = (doc.content || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const humanScore = doc.process_data?.humanIndex || 0;

  // Már beadta-e?
  const { data: existing } = await db.from('submissions')
    .select('id')
    .eq('doc_id', docId)
    .eq('student_id', currentUser.id)
    .single();

  if (existing) { showToast('⚠️ Ezt a dokumentumot már beadtad.'); return null; }

  // Beadás mentése
  const { data, error } = await db.from('submissions')
    .insert({
      class_id:     profile.class_id,
      student_id:   currentUser.id,
      student_name: profile.username,
      doc_id:       docId,
      human_score:  humanScore,
      word_count:   wordCount,
    })
    .select()
    .single();

  if (error) { showToast('❌ ' + error.message); return null; }

  // Email értesítő a tanárnak
  await submissionNotifyTeacher(data.id, profile.class_id, profile.username, docId);

  showToast('✅ Dolgozat sikeresen beadva!');
  return data;
}

// Diák saját beadásainak betöltése
async function submissionLoadMine() {
  if (!currentUser) return [];
  const { data } = await db.from('student_submission_overview')
    .select('*')
    .eq('student_id', currentUser.id)
    .order('submitted_at', { ascending: false });

  // RLS miatt a view-n keresztül szűrünk
  const { data: raw } = await db.from('submissions')
    .select(`
      id, doc_id, human_score, word_count, status,
      teacher_note, submitted_at, reviewed_at,
      classes(name, profiles(username))
    `)
    .eq('student_id', currentUser.id)
    .order('submitted_at', { ascending: false });

  return raw || [];
}

/* ─── 8. TANÁRI BEADÁS KEZELÉS ────────────────────────────── */

// Osztályba tartozó beadások betöltése
async function submissionLoadForClass(classId) {
  const { data } = await db.from('submissions')
    .select('*, documents(title, content, hash, process_data)')
    .eq('class_id', classId)
    .order('submitted_at', { ascending: false });
  return data || [];
}

// Beadás státuszának frissítése (tanár)
async function submissionReview(submissionId, status, note = '') {
  const { data: sub, error: fetchErr } = await db.from('submissions')
    .select('student_id, doc_id, class_id')
    .eq('id', submissionId)
    .single();
  if (fetchErr) { showToast('❌ ' + fetchErr.message); return false; }

  const { error } = await db.from('submissions')
    .update({
      status,
      teacher_note: note.trim() || null,
      reviewed_at:  new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (error) { showToast('❌ ' + error.message); return false; }

  // Email értesítő a diáknak
  await submissionNotifyStudent(submissionId, sub.student_id, status, note);

  showToast('✅ Beadás frissítve.');
  return true;
}

/* ─── 9. EMAIL ÉRTESÍTŐK ──────────────────────────────────── */

// Tanárnak: új beadás érkezett
async function submissionNotifyTeacher(submissionId, classId, studentName, docId) {
  try {
    // Tanár emailjének lekérése
    const { data: cls } = await db.from('classes')
      .select('teacher_id')
      .eq('id', classId)
      .single();
    if (!cls) return;

    const { data: teacherProfile } = await db.from('profiles')
      .select('id')
      .eq('id', cls.teacher_id)
      .single();
    if (!teacherProfile) return;

    const { data: { user } } = await db.auth.admin
      ? { data: { user: null } } // admin API nem elérhető client oldalon
      : { data: { user: null } };

    // Email küldése Edge Function-ön keresztül
    const { data: { session } } = await db.auth.getSession();
    await fetch(`${SUPA_URL}/functions/v1/${EDU_CONFIG.emailFunction}`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        to:      null, // Edge Function kiolvassa a teacher_id alapján
        type:    'submission_received',
        subject: `HUMANO – Új beadás: ${studentName}`,
        message: `Új dolgozat érkezett!\n\nDiák: ${studentName}\nDOC ID: ${docId}\n\nTekintsd meg a tanári panelen.`,
        meta: { submission_id: submissionId, teacher_id: cls.teacher_id },
      }),
    });

    // Napló
    await db.from('edu_email_log').insert({
      submission_id: submissionId,
      recipient_email: 'teacher',
      email_type: 'submission_received',
    });
  } catch (err) {
    console.warn('Tanár értesítő hiba:', err);
  }
}

// Diáknak: visszajelzés érkezett
async function submissionNotifyStudent(submissionId, studentId, status, note) {
  try {
    const typeMap = {
      accepted: 'submission_accepted',
      rejected: 'submission_rejected',
      revision: 'submission_revision',
    };
    const subjectMap = {
      accepted: 'HUMANO – Dolgozatodat elfogadták ✅',
      rejected: 'HUMANO – Dolgozatodat visszaküldték ❌',
      revision: 'HUMANO – Javítást kértek a dolgozatodhoz 🔄',
    };
    const msgMap = {
      accepted: `Gratulálunk! A tanárod elfogadta a dolgozatodat.`,
      rejected: `A tanárod visszaküldte a dolgozatodat.`,
      revision: `A tanárod javítást kér a dolgozatodon.`,
    };

    const { data: { session } } = await db.auth.getSession();
    await fetch(`${SUPA_URL}/functions/v1/${EDU_CONFIG.emailFunction}`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        type:    typeMap[status] || 'general',
        subject: subjectMap[status] || 'HUMANO – Visszajelzés',
        message: `${msgMap[status] || ''}\n\nTanár megjegyzése:\n${note || '(nincs megjegyzés)'}\n\nTekintsd meg a diák panelen.`,
        meta: { submission_id: submissionId, student_id: studentId },
      }),
    });

    await db.from('edu_email_log').insert({
      submission_id: submissionId,
      recipient_email: 'student',
      email_type: typeMap[status] || 'general',
    });

    // Beadáson email_sent flag frissítése
    await db.from('submissions')
      .update({ email_sent: true })
      .eq('id', submissionId);

  } catch (err) {
    console.warn('Diák értesítő hiba:', err);
  }
}

/* ─── 10. ÜZENETEK ────────────────────────────────────────── */

// Üzenet küldése
async function messageSend(submissionId, text, role) {
  if (!currentUser || !text.trim()) return null;
  const { data, error } = await db.from('submission_messages')
    .insert({
      submission_id: submissionId,
      sender_id:     currentUser.id,
      sender_role:   role,
      message:       text.trim(),
    })
    .select()
    .single();
  if (error) { showToast('❌ ' + error.message); return null; }

  // Email értesítő a másik félnek
  await messageNotify(submissionId, role);
  return data;
}

// Üzenetek betöltése egy beadáshoz
async function messageLoad(submissionId) {
  const { data } = await db.from('submission_messages')
    .select('*, profiles(username)')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });
  return data || [];
}

// Üzenet olvasottnak jelölése
async function messageMarkRead(submissionId) {
  await db.from('submission_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('submission_id', submissionId)
    .neq('sender_id', currentUser.id)
    .is('read_at', null);
}

// Értesítés küldése üzenet esetén
async function messageNotify(submissionId, senderRole) {
  try {
    // Értesítési beállítás ellenőrzése
    const { data: sub } = await db.from('submissions')
      .select('student_id, class_id')
      .eq('id', submissionId).single();
    if (!sub) return;

    const { data: cls } = await db.from('classes')
      .select('teacher_id')
      .eq('id', sub.class_id).single();
    if (!cls) return;

    const recipientId = senderRole === 'teacher' ? sub.student_id : cls.teacher_id;
    const prefCol     = senderRole === 'teacher' ? 'notify_new_message' : 'notify_new_message';

    const { data: pref } = await db.from('profiles')
      .select(prefCol)
      .eq('id', recipientId).single();
    if (!pref?.notify_new_message) return;
    const { data: { session } } = await db.auth.getSession();
    await fetch(`${SUPA_URL}/functions/v1/${EDU_CONFIG.emailFunction}`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        type:    'new_message',
        subject: 'HUMANO – Új üzenet érkezett',
        message: `Új üzenet érkezett a beadásodhoz.\n\nTekintsd meg a panelen.`,
        meta: { submission_id: submissionId, sender_role: senderRole },
      }),
    });

    await db.from('edu_email_log').insert({
      submission_id: submissionId,
      recipient_email: senderRole === 'teacher' ? 'student' : 'teacher',
      email_type: 'new_message',
    });
  } catch (err) {
    console.warn('Üzenet értesítő hiba:', err);
  }
}

/* ─── 11. REALTIME – ÉLŐ FRISSÍTÉS ───────────────────────── */

let _realtimeChannel = null;

// Beadások figyelése (tanár panelen)
function realtimeWatchSubmissions(classId, onNew) {
  if (_realtimeChannel) _realtimeChannel.unsubscribe();
  _realtimeChannel = db
    .channel('submissions-' + classId)
    .on('postgres_changes', {
      event:  'INSERT',
      schema: 'public',
      table:  'submissions',
      filter: `class_id=eq.${classId}`,
    }, payload => {
      showToast('🔔 Új beadás érkezett!');
      if (typeof onNew === 'function') onNew(payload.new);
    })
    .subscribe();
}

// Üzenetek figyelése
function realtimeWatchMessages(submissionId, onNew) {
  const ch = db
    .channel('messages-' + submissionId)
    .on('postgres_changes', {
      event:  'INSERT',
      schema: 'public',
      table:  'submission_messages',
      filter: `submission_id=eq.${submissionId}`,
    }, payload => {
      if (typeof onNew === 'function') onNew(payload.new);
    })
    .subscribe();
  return ch;
}

function realtimeStop() {
  if (_realtimeChannel) {
    _realtimeChannel.unsubscribe();
    _realtimeChannel = null;
  }
}

/* ─── 12. UI SEGÉDFÜGGVÉNYEK ──────────────────────────────── */

function eduStatusBadge(status) {
  const map = {
    pending:  { label: 'Várakozik',  color: 'var(--gold)',    icon: '⏳' },
    accepted: { label: 'Elfogadva',  color: 'var(--success)', icon: '✅' },
    rejected: { label: 'Visszaküldve', color: '#e05555',      icon: '❌' },
    revision: { label: 'Javítandó',  color: '#f09030',        icon: '🔄' },
  };
  const s = map[status] || map.pending;
  return `<span style="padding:.2rem .7rem;border-radius:20px;font-size:.72rem;
    font-weight:700;background:rgba(0,0,0,.2);border:1px solid ${s.color};
    color:${s.color}">${s.icon} ${s.label}</span>`;
}

function eduHumanScoreBadge(score) {
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--gold)' : '#e05555';
  return `<span style="font-family:var(--font-display);font-size:1.1rem;
    font-weight:700;color:${color}">${score}%</span>`;
}

function eduCopyLink(link) {
  navigator.clipboard?.writeText(link).then(() => showToast('🔗 Link másolva!'));
}

function eduFmtExpiry(isoDate) {
  if (!isoDate) return '–';
  const d    = new Date(isoDate);
  const diff = Math.ceil((d - Date.now()) / 86400000);
  if (diff < 0)  return '❌ Lejárt';
  if (diff === 0) return '⚠️ Ma jár le';
  return `${diff} nap múlva jár le`;
}

/* ─── 13. JOIN OLDAL INIT ─────────────────────────────────── */

// Automatikusan fut ha ?token= van az URL-ben
async function eduJoinInit() {
  const token = new URLSearchParams(window.location.search).get('token');
  if (!token) return;

  const result = await studentJoin(token);
  if (!result.ok) {
    showToast('❌ ' + result.error);
    return;
  }

  // Személyre szabott üdvözlés
  const invite = result.invite;
  const nameEl = document.getElementById('join-student-name');
  if (nameEl && invite.student_name) nameEl.textContent = invite.student_name;

  // Token eltárolása a regisztráció/belépés után használathoz
  sessionStorage.setItem('humano_join_token', token);

  // Ha már be van jelentkezve, azonnal aktivál
  if (currentUser) {
    await studentActivate(token);
    window.location.href = '/student.html';
  }
  // Ha nincs bejelentkezve: a regisztrációs form submit-jén hívódik az aktiválás
}

// Regisztráció/belépés után a join token feldolgozása
async function eduPostAuthJoin() {
  const token = sessionStorage.getItem('humano_join_token');
  if (!token || !currentUser) return;
  sessionStorage.removeItem('humano_join_token');
  await studentActivate(token);
}

/* ─── 14. GLOBÁLIS EXPORT ─────────────────────────────────── */

window.Edu = {
  // Szerepkör
  getRole:               eduGetRole,
  requireRole:           eduRequireRole,

  // Tanár
  teacherCheckCode,
  teacherActivate,

  // Osztály
  classCreate,
  classLoadAll,
  classDelete,

  // Meghívók
  inviteCreateForClass,
  inviteCreatePersonal,
  inviteSendEmail,
  inviteLoadForClass,

  // Diák join
  studentJoin,
  studentActivate,
  postAuthJoin:          eduPostAuthJoin,
  joinInit:              eduJoinInit,

  // Beadás
  submissionCreate,
  submissionLoadMine,
  submissionLoadForClass,
  submissionReview,

  // Üzenetek
  messageLoad,
  messageSend:           messageLoad,
  messageMarkRead,

  // Realtime
  watchSubmissions:      realtimeWatchSubmissions,
  watchMessages:         realtimeWatchMessages,
  stopRealtime:          realtimeStop,

  // Értesítési beállítások
  teacherUpdateNotifySettings,
  teacherLoadNotifySettings,

  // UI
  statusBadge:           eduStatusBadge,
  humanScoreBadge:       eduHumanScoreBadge,
  copyLink:              eduCopyLink,
  fmtExpiry:             eduFmtExpiry,
};
