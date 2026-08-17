import { db } from '../src/db/index.js';
import { incidents, dispatches, employees, caseAccessTokens } from '../src/db/schema.js';
import { randomBytes, createHash } from 'crypto';
import { eq } from 'drizzle-orm';

async function generateFreshLink() {
  try {
    const allIncidents = await db.select().from(incidents);
    if (allIncidents.length === 0) {
      console.error("No incidents found");
      process.exit(1);
    }
    const incident = allIncidents[0];

    const allDispatches = await db.select().from(dispatches);
    let dispatch = allDispatches.find(d => d.accidentId === incident.id);

    const allEmployees = await db.select().from(employees);
    const emp = allEmployees[0];

    if (!dispatch) {
      dispatch = {
        id: `disp-${Date.now()}`,
        accidentId: incident.id,
        agentId: emp.id,
        assignedAt: new Date().toISOString(),
        notes: 'تكليف ميداني رسمي عبر العمليات',
        priority: 'عاجلة',
        status: 'قبول'
      };
      await db.insert(dispatches).values(dispatch);
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(caseAccessTokens).values({
      tokenHash,
      incidentId: incident.id,
      dispatchId: dispatch.id,
      fieldOfficerId: emp.id,
      expiresAt
    });

    const finalCaseUrl = `https://incident.palcom.online/field/case/${incident.id}?dispatch=${dispatch.id}&token=${rawToken}`;
    
    console.log(`FINAL_CASE_URL = ${finalCaseUrl}`);
    console.log(`USERNAME = ${emp.employeeCode.toLowerCase()}`);
    console.log(`TOKEN_EXPIRES_AT = ${expiresAt.toISOString()}`);

  } catch (error) {
    console.error("Error generating fresh link:", error);
  } finally {
    process.exit(0);
  }
}

generateFreshLink();
