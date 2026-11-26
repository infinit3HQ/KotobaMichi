export type RecapStats = {
	studied: number;
	learned: number;
	dueNow: number;
	streak: number;
	mocks: { examId: string; correct: number; total: number }[];
	weakest: string | null;
};

function escape(text: string) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function layout(
	title: string,
	paragraphs: string[],
	cta: { label: string; href: string },
	settingsUrl: string
) {
	const body = paragraphs
		.map(
			p =>
				`<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#333">${p}</p>`
		)
		.join('');
	return `<!doctype html><html><body style="margin:0;background:#f6f5f2;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:480px;background:#fff;border-radius:12px;padding:28px">
<tr><td>
<p style="margin:0 0 6px;font-size:13px;color:#b23a2b;font-weight:600">言葉道 Kotobamichi</p>
<h1 style="margin:0 0 18px;font-size:22px;color:#111">${title}</h1>
${body}
<p style="margin:22px 0"><a href="${escape(cta.href)}" style="background:#b23a2b;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600;font-size:15px">${cta.label}</a></p>
<p style="margin:24px 0 0;font-size:12px;color:#888">You get this because you turned it on. <a href="${escape(settingsUrl)}" style="color:#888">Change email settings</a>.</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function reminderEmail(vars: {
	name: string;
	streak: number;
	dueNow: number;
	practiceUrl: string;
	settingsUrl: string;
}) {
	const hello = vars.name ? `${escape(vars.name)}, ` : '';
	const streakLine =
		vars.streak > 0
			? `${hello}your ${vars.streak}-day streak is waiting for today's practice.`
			: `${hello}a few minutes today keeps the words fresh.`;
	const dueLine =
		vars.dueNow > 0
			? `${vars.dueNow} ${vars.dueNow === 1 ? 'card is' : 'cards are'} due for review.`
			: 'Ten new words take about five minutes.';
	const subject =
		vars.streak > 0
			? `Keep your ${vars.streak}-day streak going`
			: 'Time for a little Japanese';
	const text = `${streakLine}\n\n${dueLine}\n\nPractise: ${vars.practiceUrl}\n\nChange email settings: ${vars.settingsUrl}`;
	const html = layout(
		subject,
		[streakLine, dueLine],
		{ label: 'Practise now', href: vars.practiceUrl },
		vars.settingsUrl
	);
	return { subject, text, html };
}

export function recapEmail(vars: {
	name: string;
	stats: RecapStats;
	homeUrl: string;
	settingsUrl: string;
}) {
	const { stats } = vars;
	const lines = [
		`${vars.name ? `${escape(vars.name)}, here` : 'Here'} is your week.`,
		`You studied ${stats.studied} ${stats.studied === 1 ? 'card' : 'cards'} and learned ${stats.learned} new ${stats.learned === 1 ? 'word' : 'words'}. Your streak is ${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}.`,
	];
	if (stats.mocks.length > 0) {
		const scores = stats.mocks
			.map(m => `${escape(m.examId.toUpperCase())} ${m.correct}/${m.total}`)
			.join(', ');
		lines.push(`Mock exams this week: ${scores}.`);
	}
	if (stats.weakest)
		lines.push(
			`Your weakest area lately is ${escape(stats.weakest)}. A short drill there pays off most.`
		);
	lines.push(
		stats.dueNow > 0
			? `${stats.dueNow} reviews are due now. Clearing them first is the quickest win.`
			: 'Nothing is due right now, so it is a good week for new words.'
	);
	const subject = 'Your week in Japanese';
	const text = `${lines.join('\n\n')}\n\nOpen Kotobamichi: ${vars.homeUrl}\n\nChange email settings: ${vars.settingsUrl}`;
	const html = layout(
		subject,
		lines,
		{ label: "Plan this week's study", href: vars.homeUrl },
		vars.settingsUrl
	);
	return { subject, text, html };
}
